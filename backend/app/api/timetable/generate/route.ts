import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

function getWeekStartDate(startDate?: string) {
  const date = startDate ? new Date(startDate) : new Date();
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // make Monday = 0
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function formatTimeSlot(slot: string) {
  const [hour, minute] = slot.split(':').map(Number);
  return { hour, minute };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const campusId = body.campusId ? String(body.campusId).trim() : undefined;
  const startDate = body.startDate ? String(body.startDate).trim() : undefined;

  const halls = await prisma.hall.findMany({
    where: campusId ? { building: { campusId } } : undefined,
    include: {
      building: { include: { campus: true } },
    },
  });

  const courses = await prisma.course.findMany({
    orderBy: [
      { department: 'asc' },
      { level: 'asc' },
      { code: 'asc' },
    ],
  });

  if (courses.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No courses found to generate timetable.' });
  }

  if (halls.length === 0) {
    return NextResponse.json({ jobId: 'none', message: 'No halls available to schedule courses.' }, { status: 400 });
  }

  const baseDate = getWeekStartDate(startDate);
  const instructorSchedule = new Map<string, Set<string>>();
  const hallSchedule = new Map<string, Set<string>>();
  const generatedEntries: Array<{
    campusId: string;
    courseId: string;
    hallId: string;
    startTime: Date;
    endTime: Date;
    day: string;
  }> = [];

  for (const course of courses) {
    let assigned = false;

    for (let dayIndex = 0; dayIndex < DAYS.length && !assigned; dayIndex += 1) {
      for (const slot of TIME_SLOTS) {
        const slotKey = `${DAYS[dayIndex]}-${slot}`;

        for (const hall of halls) {
          const hallKey = `${hall.id}-${slotKey}`;
          const instructorKey = `${course.instructor}-${slotKey}`;

          const hallTaken = hallSchedule.get(hall.id)?.has(slotKey);
          const instructorTaken = instructorSchedule.get(course.instructor)?.has(slotKey);
          if (hallTaken || instructorTaken) continue;

          const { hour, minute } = formatTimeSlot(slot);
          const startTime = new Date(baseDate);
          startTime.setUTCDate(baseDate.getUTCDate() + dayIndex);
          startTime.setUTCHours(hour, minute, 0, 0);
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
            day: DAYS[dayIndex],
          });
          assigned = true;
          break;
        }
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

  const jobId = `generate-${Date.now()}`;
  return NextResponse.json({
    jobId,
    message: `Generated ${created.length} timetable entries using the constraint solver.`,
    generated: created,
  });
}
