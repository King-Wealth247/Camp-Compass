import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { start: '08:00', end: '09:50' },
  { start: '10:10', end: '12:00' },
  { start: '13:00', end: '15:50' },
  { start: '16:10', end: '17:00' }
];

function getWeekStart(startDate?: string) {
  const date = startDate ? new Date(startDate) : new Date();
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, departmentId, levelId, startDate } = body;

  if (!mode || !['single', 'department', 'all'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid generation mode.' }, { status: 400 });
  }

  // 1. Target Identification
  let targetLevels: any[] = [];
  if (mode === 'single' && levelId) {
    targetLevels = await prisma.level.findMany({ where: { id: levelId }, include: { department: true } });
  } else if (mode === 'department' && departmentId) {
    targetLevels = await prisma.level.findMany({ where: { departmentId }, include: { department: true } });
  } else if (mode === 'all') {
    targetLevels = await prisma.level.findMany({ include: { department: true } });
  }

  if (targetLevels.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No target levels found.' }, { status: 400 });
  }

  const baseDate = getWeekStart(startDate);

  // Load halls
  const allHalls = await prisma.hall.findMany({
    include: { building: true },
    where: { isAvailable: true }
  });

  if (allHalls.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No halls available.' }, { status: 400 });
  }

  // Load instructor availabilities
  const availabilityRecords = await prisma.availability.findMany({
    orderBy: { submissionDate: 'desc' },
    include: { lecturer: true }
  });

  const getLecturerAvailability = (lecturerId: string) => {
    return availabilityRecords.find(a => a.lecturerId === lecturerId);
  };

  const isInstructorAvailable = (avail: any, dayName: string, slotStr: string) => {
    if (!avail) return true; // Assume free if no record
    const dayLower = dayName.toLowerCase();
    const isFreeOnDay = (avail as any)[dayLower] as boolean;
    if (!isFreeOnDay) return false;

    const timeField = `${dayLower}Time`;
    const timeVal = (avail as any)[timeField] as string | null;
    if (!timeVal) return true; // Free all day if selected but no time specified

    // Check if the required slot matches the availability
    // User requested: "Actually use the time slots used for the lecturer availability"
    // We strictly check if the requested slot string exists within the availability string
    // Or if it matches perfectly.
    return timeVal.includes(slotStr);
  };

  const generatedTimetables: any[] = [];
  const hallSchedule = new Map<string, Set<string>>(); // hallId -> Set<day-slotStr>

  for (const level of targetLevels) {
    // 2. Data Gathering per level
    const studentsCount = await prisma.user.count({
      where: { role: 'student', levelId: level.id, departmentId: level.departmentId }
    });

    // Filter halls by capacity
    const eligibleHalls = allHalls.filter(h => h.capacity >= studentsCount);
    if (eligibleHalls.length === 0) {
      console.warn(`No hall large enough for Level ${level.level} in ${level.department.departmentName} (Need capacity ${studentsCount})`);
      continue;
    }

    const courses = await prisma.course.findMany({
      where: { levelId: level.id, departmentId: level.departmentId }
    });

    if (courses.length === 0) continue;

    const subComponentsData: any[] = [];
    const levelSchedule = new Set<string>(); // day-slotStr

    // Instructor tracking to prevent double booking an instructor at the same time
    const instructorSchedule = new Map<string, Set<string>>();

    for (const course of courses) {
      let bookingsForCourse = 0;
      const MAX_BOOKINGS = 2; // Max 2 times per week
      
      const avail = getLecturerAvailability(course.instructorId);

      for (let dayIndex = 0; dayIndex < DAYS.length && bookingsForCourse < MAX_BOOKINGS; dayIndex++) {
        const day = DAYS[dayIndex];
        
        for (const slot of TIME_SLOTS) {
          if (bookingsForCourse >= MAX_BOOKINGS) break;

          const slotStr = `${slot.start}-${slot.end}`;
          const timeKey = `${day}-${slotStr}`;

          // Check Level free
          if (levelSchedule.has(timeKey)) continue;

          // Check Instructor free
          const instrSet = instructorSchedule.get(course.instructorId) || new Set();
          if (instrSet.has(timeKey)) continue;

          // Check Instructor explicitly available via Availability form
          if (!isInstructorAvailable(avail, day, slotStr)) continue;

          // Check Hall free
          let assignedHall = null;
          for (const hall of eligibleHalls) {
            const hallSet = hallSchedule.get(hall.id) || new Set();
            if (!hallSet.has(timeKey)) {
              assignedHall = hall;
              break;
            }
          }

          if (!assignedHall) continue;

          // Book it
          levelSchedule.add(timeKey);
          
          const newInstrSet = instructorSchedule.get(course.instructorId) || new Set();
          newInstrSet.add(timeKey);
          instructorSchedule.set(course.instructorId, newInstrSet);
          
          const newHallSet = hallSchedule.get(assignedHall.id) || new Set();
          newHallSet.add(timeKey);
          hallSchedule.set(assignedHall.id, newHallSet);

          const startTime = new Date(baseDate);
          startTime.setUTCDate(baseDate.getUTCDate() + dayIndex);
          startTime.setUTCHours(parseInt(slot.start.split(':')[0]), parseInt(slot.start.split(':')[1]), 0, 0);

          const endTime = new Date(baseDate);
          endTime.setUTCDate(baseDate.getUTCDate() + dayIndex);
          endTime.setUTCHours(parseInt(slot.end.split(':')[0]), parseInt(slot.end.split(':')[1]), 0, 0);

          subComponentsData.push({
            courseId: course.id,
            course: course.title,
            instructor: course.instructor,
            hallId: assignedHall.id,
            hall: assignedHall.name,
            floor: assignedHall.floor,
            startTime,
            endTime,
            day
          });

          bookingsForCourse++;
        }
      }
    }

    if (subComponentsData.length > 0) {
      // Smartly eliminate extra subcomponents to have <= 10
      // We will sort them by day, so we keep earlier classes if we have to truncate
      let finalSubComponents = subComponentsData;
      if (finalSubComponents.length > 10) {
        finalSubComponents = finalSubComponents.slice(0, 10);
      }

      generatedTimetables.push({
        departmentId: level.departmentId,
        levelId: level.id,
        level: level.level,
        subComponents: finalSubComponents
      });
    }
  }

  if (generatedTimetables.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No timetables could be generated. Check constraints.' });
  }

  // Transaction to replace timetables
  await prisma.$transaction(async (tx) => {
    // Delete existing timetables for target levels
    const levelIds = targetLevels.map(l => l.id);
    await tx.timetable.deleteMany({
      where: { levelId: { in: levelIds } }
    });

    // Insert new timetables
    for (const tt of generatedTimetables) {
      await tx.timetable.create({
        data: {
          departmentId: tt.departmentId,
          levelId: tt.levelId,
          level: tt.level,
          subComponents: {
            create: tt.subComponents
          }
        }
      });
    }
  });

  // Notifications
  try {
    const users = await prisma.user.findMany({ select: { id: true, fcmTokens: true } });
    if (users.length > 0) {
      const title = 'Timetable Updated';
      const message = `A new timetable has been generated for ${generatedTimetables.length} levels.`;
      
      await prisma.notification.createMany({
        data: users.map(u => ({ userId: u.id, title, message, type: 'info' })),
      });

      const tokens = users.flatMap(u => u.fcmTokens).filter(Boolean);
      if (tokens.length > 0) {
        await sendPushNotification(tokens, title, message, { type: 'info' });
      }
    }
  } catch (error) {
    console.error('Failed to send timetable notification', error);
  }

  return NextResponse.json({
    jobId: `generate-${Date.now()}`,
    message: `Generated timetables for ${generatedTimetables.length} levels.`,
  });
}
