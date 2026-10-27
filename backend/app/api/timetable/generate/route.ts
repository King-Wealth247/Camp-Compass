import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

/**
 * POST /api/timetable/generate
 *
 * Three generation modes (Workstream 1a):
 *
 * mode: "absolute"    — Deletes ALL existing timetables and regenerates from scratch.
 *                       Honors course-priority rule based on last-month frequency.
 *                       Guarantees at least 1 free hall per campus per day.
 *                       Body: { mode: "absolute", startDate?: string }
 *
 * mode: "batch"       — Generates/regenerates for a specific dept/level batch.
 *                       Does NOT touch other departments.
 *                       Body: { mode: "batch", departmentId: string, levelId?: string, startDate?: string }
 *
 * mode: "unit"        — Regenerates a single course slot only.
 *                       Preserves all other existing slots.
 *                       Body: { mode: "unit", courseId: string, startDate?: string }
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { start: '08:00', end: '09:50' },
  { start: '10:10', end: '12:00' },
  { start: '13:00', end: '14:50' },
  { start: '15:10', end: '17:00' },
];

// Maximum classes per course per week
const MAX_SLOTS_PER_COURSE = 2;

function getWeekStart(startDate?: string) {
  const date = startDate ? new Date(startDate) : new Date();
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function buildDateTime(baseDate: Date, dayIndex: number, timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setUTCDate(baseDate.getUTCDate() + dayIndex);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

/**
 * Checks if a lecturer is available on the given day/slot
 * based on their Availability record.
 */
function isInstructorAvailable(avail: any, dayName: string, slotStr: string): boolean {
  if (!avail) return true; // No record = assume always available
  const dayLower = dayName.toLowerCase() as
    | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  const isAvailableOnDay: boolean = avail[dayLower] ?? false;
  if (!isAvailableOnDay) return false;

  const timeVal: string | null = avail[`${dayLower}Time`] ?? null;
  if (!timeVal) return true; // Available all day
  return timeVal.includes(slotStr);
}

/**
 * Builds a priority score for a course based on how frequently
 * it was scheduled in the past 30 days. Higher = more priority.
 */
async function buildCoursePriorityMap(courseIds: string[]): Promise<Map<string, number>> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSubs = await prisma.timetableSubComponent.findMany({
    where: {
      courseId: { in: courseIds },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { courseId: true },
  });

  const freq = new Map<string, number>();
  for (const { courseId } of recentSubs) {
    freq.set(courseId, (freq.get(courseId) ?? 0) + 1);
  }

  const priorityMap = new Map<string, number>();
  for (const id of courseIds) {
    // Higher frequency → higher priority (scheduled first)
    priorityMap.set(id, freq.get(id) ?? 0);
  }
  return priorityMap;
}

/**
 * Core scheduling engine for a set of levels.
 * Returns array of { departmentId, levelId, level, subComponents[] }.
 *
 * Enforces:
 * - Lecturer availability from Availability model
 * - Hall capacity >= student count
 * - No hall double-booking
 * - No instructor double-booking
 * - No level time collision
 * - Free-hall guarantee per campus per day
 * - Course-priority ordering
 * - MAX_SLOTS_PER_COURSE limit per course per week
 */
async function scheduleLevels(
  levels: any[],
  allHalls: any[],
  availabilityMap: Map<string, any>,
  baseDate: Date,
  // Global booking trackers (passed in so concurrent levels share state)
  hallSchedule: Map<string, Set<string>>,
  instructorSchedule: Map<string, Set<string>>,
) {
  const generatedTimetables: any[] = [];

  for (const level of levels) {
    const studentsCount = await prisma.user.count({
      where: { role: 'student', levelId: level.id, departmentId: level.departmentId },
    });

    // Filter halls by capacity
    const eligibleHalls = allHalls.filter((h) => h.capacity >= studentsCount);
    if (eligibleHalls.length === 0) {
      console.warn(`No hall large enough for Level ${level.level} in ${level.department?.departmentName ?? level.departmentId}`);
      continue;
    }

    const courses = await prisma.course.findMany({
      where: { levelId: level.id, departmentId: level.departmentId },
    });
    if (courses.length === 0) continue;

    // Sort courses by priority (most-scheduled in last month first)
    const priorityMap = await buildCoursePriorityMap(courses.map((c) => c.id));
    const sortedCourses = [...courses].sort(
      (a, b) => (priorityMap.get(b.id) ?? 0) - (priorityMap.get(a.id) ?? 0)
    );

    const subComponentsData: any[] = [];
    const levelSchedule = new Set<string>(); // "day-slotStr" keys

    for (const course of sortedCourses) {
      let bookingsForCourse = 0;
      const avail = availabilityMap.get(course.instructorId);

      for (let dayIndex = 0; dayIndex < DAYS.length && bookingsForCourse < MAX_SLOTS_PER_COURSE; dayIndex++) {
        const day = DAYS[dayIndex];

        for (const slot of TIME_SLOTS) {
          if (bookingsForCourse >= MAX_SLOTS_PER_COURSE) break;

          const slotStr = `${slot.start}-${slot.end}`;
          const timeKey = `${day}-${slotStr}`;

          // ── Constraint checks ──────────────────────────────────────────────
          // 1. Level already has a class at this time
          if (levelSchedule.has(timeKey)) continue;

          // 2. Instructor already teaching at this time
          const instrSet = instructorSchedule.get(course.instructorId);
          if (instrSet?.has(timeKey)) continue;

          // 3. Instructor declared unavailable
          if (!isInstructorAvailable(avail, day, slotStr)) continue;

          // 4. Find a free hall (with free-hall guarantee: leave at least 1 free per campus per day)
          let assignedHall: any = null;
          for (const hall of eligibleHalls) {
            const hallSet = hallSchedule.get(hall.id);
            if (hallSet?.has(timeKey)) continue;

            // Free-hall guarantee: check that this campus will still have ≥1 free hall after booking
            const campusHallsOnDay = allHalls.filter((h) => h.building?.campusId === hall.building?.campusId);
            const bookedOnDay = campusHallsOnDay.filter((h) => {
              const hs = hallSchedule.get(h.id);
              return hs?.has(timeKey);
            }).length;
            const wouldRemainFree = campusHallsOnDay.length - bookedOnDay - 1;
            if (wouldRemainFree < 1 && campusHallsOnDay.length > 1) {
              // Skip this hall to preserve at least 1 free per campus per day
              continue;
            }

            assignedHall = hall;
            break;
          }

          if (!assignedHall) continue;

          // ── Book the slot ──────────────────────────────────────────────────
          levelSchedule.add(timeKey);

          const newInstrSet = instructorSchedule.get(course.instructorId) ?? new Set<string>();
          newInstrSet.add(timeKey);
          instructorSchedule.set(course.instructorId, newInstrSet);

          const newHallSet = hallSchedule.get(assignedHall.id) ?? new Set<string>();
          newHallSet.add(timeKey);
          hallSchedule.set(assignedHall.id, newHallSet);

          subComponentsData.push({
            courseId: course.id,
            course: course.title,
            instructor: course.instructor,
            hallId: assignedHall.id,
            hall: assignedHall.name,
            floor: assignedHall.floor,
            startTime: buildDateTime(baseDate, dayIndex, slot.start),
            endTime: buildDateTime(baseDate, dayIndex, slot.end),
            day,
          });

          bookingsForCourse++;
        }
      }

      if (bookingsForCourse === 0) {
        console.warn(`Could not schedule course "${course.title}" (${course.code}) — no valid slot found.`);
      }
    }

    if (subComponentsData.length > 0) {
      generatedTimetables.push({
        departmentId: level.departmentId,
        levelId: level.id,
        level: level.level,
        subComponents: subComponentsData,
      });
    }
  }

  return generatedTimetables;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, departmentId, levelId, courseId, startDate, publishedBy } = body;

  if (!mode || !['absolute', 'batch', 'unit'].includes(mode)) {
    return NextResponse.json(
      { error: 'mode must be one of: absolute, batch, unit' },
      { status: 400 }
    );
  }

  const baseDate = getWeekStart(startDate);

  // ── Load shared resources ────────────────────────────────────────────────
  const allHalls = await prisma.hall.findMany({
    include: { building: { include: { campus: true } } },
    where: { isAvailable: true },
  });

  if (allHalls.length === 0) {
    return NextResponse.json({ error: 'No available halls found.' }, { status: 400 });
  }

  const availabilityRecords = await prisma.availability.findMany({
    orderBy: { submissionDate: 'desc' },
  });
  // Build a map: lecturerId → latest availability record
  const availabilityMap = new Map<string, any>();
  for (const rec of availabilityRecords) {
    if (!availabilityMap.has(rec.lecturerId)) {
      availabilityMap.set(rec.lecturerId, rec);
    }
  }

  // Global booking trackers
  const hallSchedule = new Map<string, Set<string>>();
  const instructorSchedule = new Map<string, Set<string>>();

  // ── MODE: ABSOLUTE ───────────────────────────────────────────────────────
  if (mode === 'absolute') {
    const allLevels = await prisma.level.findMany({
      include: { department: true },
    });

    if (allLevels.length === 0) {
      return NextResponse.json({ error: 'No levels found in the database.' }, { status: 400 });
    }

    const generatedTimetables = await scheduleLevels(
      allLevels, allHalls, availabilityMap, baseDate, hallSchedule, instructorSchedule
    );

    if (generatedTimetables.length === 0) {
      return NextResponse.json({
        error: 'No timetables could be generated. Check availability and hall constraints.',
      }, { status: 422 });
    }

    // Transactional replace: delete all → insert new (all as drafts)
    await prisma.$transaction(async (tx) => {
      await tx.timetable.deleteMany({});
      for (const tt of generatedTimetables) {
        await tx.timetable.create({
          data: {
            departmentId: tt.departmentId,
            levelId: tt.levelId,
            level: tt.level,
            generationMode: 'absolute',
            status: 'draft',
            subComponents: { create: tt.subComponents },
          },
        });
      }
    });

    await notifyTimetableUpdate(
      generatedTimetables.length,
      'Absolute generation complete',
      publishedBy
    );

    return NextResponse.json({
      mode: 'absolute',
      generated: generatedTimetables.length,
      status: 'draft',
      message: `Generated ${generatedTimetables.length} timetable(s). Review and publish via /api/timetable/publish.`,
    });
  }

  // ── MODE: BATCH ──────────────────────────────────────────────────────────
  if (mode === 'batch') {
    if (!departmentId) {
      return NextResponse.json({ error: 'departmentId is required for batch mode.' }, { status: 400 });
    }

    const where: any = { departmentId };
    if (levelId) where.id = levelId;

    const targetLevels = await prisma.level.findMany({
      where,
      include: { department: true },
    });

    if (targetLevels.length === 0) {
      return NextResponse.json({ error: 'No levels found for the given department/level.' }, { status: 400 });
    }

    // Seed existing bookings from other departments so we respect cross-dept constraints
    const existingSubComponents = await prisma.timetableSubComponent.findMany({
      where: {
        timetable: {
          departmentId: { not: departmentId },
          status: 'published',
        },
      },
      select: { hallId: true, day: true, startTime: true, endTime: true, instructor: true },
    });
    for (const sub of existingSubComponents) {
      const slotStart = new Date(sub.startTime).toTimeString().slice(0, 5);
      const slotEnd = new Date(sub.endTime).toTimeString().slice(0, 5);
      const key = `${sub.day}-${slotStart}-${slotEnd}`;
      const hs = hallSchedule.get(sub.hallId) ?? new Set<string>();
      hs.add(key);
      hallSchedule.set(sub.hallId, hs);
    }

    const generatedTimetables = await scheduleLevels(
      targetLevels, allHalls, availabilityMap, baseDate, hallSchedule, instructorSchedule
    );

    if (generatedTimetables.length === 0) {
      return NextResponse.json({
        error: 'No timetables could be generated for the specified batch.',
      }, { status: 422 });
    }

    const levelIds = targetLevels.map((l) => l.id);
    await prisma.$transaction(async (tx) => {
      await tx.timetable.deleteMany({ where: { levelId: { in: levelIds } } });
      for (const tt of generatedTimetables) {
        await tx.timetable.create({
          data: {
            departmentId: tt.departmentId,
            levelId: tt.levelId,
            level: tt.level,
            generationMode: 'batch',
            status: 'draft',
            subComponents: { create: tt.subComponents },
          },
        });
      }
    });

    return NextResponse.json({
      mode: 'batch',
      generated: generatedTimetables.length,
      status: 'draft',
      message: `Batch generated ${generatedTimetables.length} timetable(s) for department. Review and publish.`,
    });
  }

  // ── MODE: UNIT ───────────────────────────────────────────────────────────
  if (mode === 'unit') {
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required for unit mode.' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { departmentRef: true, levelRef: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Find the timetable for this course's dept/level
    const timetable = await prisma.timetable.findFirst({
      where: {
        departmentId: course.departmentId,
        levelId: course.levelId,
        status: { in: ['draft', 'published'] },
      },
      include: { subComponents: true },
    });

    if (!timetable) {
      return NextResponse.json({ error: 'No existing timetable found for this course. Run batch or absolute generation first.' }, { status: 404 });
    }

    // Seed existing bookings (excluding this course's existing slots)
    const otherSubs = timetable.subComponents.filter((s) => s.courseId !== courseId);
    for (const sub of otherSubs) {
      const slotStart = new Date(sub.startTime).toTimeString().slice(0, 5);
      const slotEnd = new Date(sub.endTime).toTimeString().slice(0, 5);
      const key = `${sub.day}-${slotStart}-${slotEnd}`;
      const hs = hallSchedule.get(sub.hallId) ?? new Set<string>();
      hs.add(key);
      hallSchedule.set(sub.hallId, hs);
    }

    const studentsCount = await prisma.user.count({
      where: { role: 'student', levelId: course.levelId, departmentId: course.departmentId },
    });
    const eligibleHalls = allHalls.filter((h) => h.capacity >= studentsCount);
    const avail = availabilityMap.get(course.instructorId);

    const newSlots: any[] = [];
    let bookings = 0;

    outer: for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
      const day = DAYS[dayIndex];
      for (const slot of TIME_SLOTS) {
        if (bookings >= MAX_SLOTS_PER_COURSE) break outer;
        const slotStr = `${slot.start}-${slot.end}`;
        const timeKey = `${day}-${slotStr}`;

        if (!isInstructorAvailable(avail, day, slotStr)) continue;

        let assignedHall: any = null;
        for (const hall of eligibleHalls) {
          if (hallSchedule.get(hall.id)?.has(timeKey)) continue;
          assignedHall = hall;
          break;
        }
        if (!assignedHall) continue;

        const hs = hallSchedule.get(assignedHall.id) ?? new Set<string>();
        hs.add(timeKey);
        hallSchedule.set(assignedHall.id, hs);

        newSlots.push({
          courseId: course.id,
          course: course.title,
          instructor: course.instructor,
          hallId: assignedHall.id,
          hall: assignedHall.name,
          floor: assignedHall.floor,
          startTime: buildDateTime(baseDate, dayIndex, slot.start),
          endTime: buildDateTime(baseDate, dayIndex, slot.end),
          day,
          timetableId: timetable.id,
        });
        bookings++;
      }
    }

    if (newSlots.length === 0) {
      return NextResponse.json({
        error: `Could not find a valid slot for course "${course.title}". All slots conflict.`,
      }, { status: 422 });
    }

    // Replace only this course's sub-components
    await prisma.$transaction(async (tx) => {
      await tx.timetableSubComponent.deleteMany({
        where: { timetableId: timetable.id, courseId },
      });
      await tx.timetableSubComponent.createMany({ data: newSlots });
    });

    return NextResponse.json({
      mode: 'unit',
      courseId,
      courseTitle: course.title,
      slotsAssigned: newSlots.length,
      status: 'updated',
      message: `Unit generated ${newSlots.length} slot(s) for "${course.title}".`,
    });
  }

  return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
}

async function notifyTimetableUpdate(count: number, reason: string, publishedBy?: string) {
  try {
    const users = await prisma.user.findMany({ select: { id: true, fcmTokens: true } });
    const title = '📅 New Timetable Generated';
    const message = `${count} timetable(s) have been generated. Check your schedule for updates.`;

    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title, message, type: 'info' })),
    });

    const tokens = users.flatMap((u) => u.fcmTokens).filter(Boolean);
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, message, { type: 'timetable_generated' });
    }
  } catch (e) {
    console.error('Timetable notification error:', e);
  }
}
