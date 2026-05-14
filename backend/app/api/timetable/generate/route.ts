import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Map a time range string to allowed start hours
function allowedHours(timeRange: string | null | undefined): number[] {
  if (!timeRange) return [8, 9, 10, 11, 13, 14, 15, 16]; // default: full day
  if (timeRange === '08:00-12:00') return [8, 9, 10, 11];
  if (timeRange === '13:00-17:00') return [13, 14, 15, 16];
  if (timeRange === '08:00-17:00') return [8, 9, 10, 11, 13, 14, 15, 16];
  return [8, 9, 10, 11, 13, 14, 15, 16];
}

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
  const campusId = body.campusId ? String(body.campusId).trim() : undefined;
  const startDate = body.startDate ? String(body.startDate).trim() : undefined;

  const halls = await prisma.hall.findMany({
    where: campusId ? { building: { campusId } } : undefined,
    include: { building: { include: { campus: true } } },
  });

  const courses = await prisma.course.findMany({
    orderBy: [{ department: 'asc' }, { level: 'asc' }, { code: 'asc' }],
  });

  if (courses.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No courses found to generate timetable.' });
  }
  if (halls.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No halls available.' }, { status: 400 });
  }

  // Fetch the most recent availability record per lecturer
  const allInstructors = [...new Set(courses.map((c) => c.instructor))];
  const availabilityMap: Record<string, Record<string, number[]>> = {};

  for (const instructorName of allInstructors) {
    const user = await prisma.user.findFirst({ where: { name: instructorName, role: 'staff' } });
    if (!user) {
      // No user found — default to full availability
      availabilityMap[instructorName] = Object.fromEntries(DAYS.map((d) => [d, allowedHours(null)]));
      continue;
    }

    const latest = await prisma.availability.findFirst({
      where: { lecturerId: user.id },
      orderBy: { submissionDate: 'desc' },
    });

    if (!latest) {
      availabilityMap[instructorName] = Object.fromEntries(DAYS.map((d) => [d, allowedHours(null)]));
      continue;
    }

    availabilityMap[instructorName] = {
      Monday:    latest.monday    ? allowedHours(latest.mondayTime)    : [],
      Tuesday:   latest.tuesday   ? allowedHours(latest.tuesdayTime)   : [],
      Wednesday: latest.wednesday ? allowedHours(latest.wednesdayTime) : [],
      Thursday:  latest.thursday  ? allowedHours(latest.thursdayTime)  : [],
      Friday:    latest.friday    ? allowedHours(latest.fridayTime)    : [],
    };
  }

  const baseDate = getWeekStart(startDate);
  const instructorSchedule = new Map<string, Set<string>>();
  const hallSchedule = new Map<string, Set<string>>();
  const generatedEntries: Array<{
    campusId: string; courseId: string; hallId: string;
    startTime: Date; endTime: Date; day: string;
  }> = [];

  for (const course of courses) {
    let assigned = false;
    const instrAvail = availabilityMap[course.instructor] ?? {};

    for (let dayIndex = 0; dayIndex < DAYS.length && !assigned; dayIndex++) {
      const day = DAYS[dayIndex];
      const hours = instrAvail[day] ?? [];

      for (const hour of hours) {
        const slotKey = `${day}-${hour}:00`;
        const instructorTaken = instructorSchedule.get(course.instructor)?.has(slotKey);
        if (instructorTaken) continue;

        for (const hall of halls) {
          const hallTaken = hallSchedule.get(hall.id)?.has(slotKey);
          if (hallTaken) continue;

          const startTime = new Date(baseDate);
          startTime.setUTCDate(baseDate.getUTCDate() + dayIndex);
          startTime.setUTCHours(hour, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setUTCHours(hour + 1);

          hallSchedule.set(hall.id, new Set([...(hallSchedule.get(hall.id) || []), slotKey]));
          instructorSchedule.set(course.instructor, new Set([...(instructorSchedule.get(course.instructor) || []), slotKey]));

          generatedEntries.push({
            campusId: hall.building.campusId,
            courseId: course.id,
            hallId: hall.id,
            startTime,
            endTime,
            day,
          });
          assigned = true;
          break;
        }
        if (assigned) break;
      }
    }
  }

  if (campusId) {
    await prisma.timetable.deleteMany({ where: { campusId } });
  }

  const created = await Promise.all(
    generatedEntries.map((entry) =>
      prisma.timetable.create({
        data: {
          campusId: entry.campusId,
          courseId: entry.courseId,
          hallId: entry.hallId,
          startTime: entry.startTime,
          endTime: entry.endTime,
          day: entry.day,
        },
        include: {
          course: true,
          hall: { include: { building: { include: { campus: true } } } },
          campus: true,
        },
      })
    )
  );

  // Trigger Notification
  try {
    const users = await prisma.user.findMany({ select: { id: true, fcmTokens: true } });
    if (users.length > 0) {
      const title = 'Timetable Updated';
      const message = `A new timetable has been generated (${created.length} classes scheduled).`;
      
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
    message: `Generated ${created.length} timetable entries respecting lecturer availability.`,
    generated: created,
  });
}
