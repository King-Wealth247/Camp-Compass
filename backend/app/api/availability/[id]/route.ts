import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

// Map availability time range string to allowed start hours
function allowedHours(timeRange: string | null): number[] {
  if (!timeRange) return [];
  if (timeRange === '08:00-12:00') return [8, 9, 10, 11];
  if (timeRange === '13:00-17:00') return [13, 14, 15, 16];
  if (timeRange === '08:00-17:00') return [8, 9, 10, 11, 13, 14, 15, 16];
  return [];
}

function getWeekStart() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

// PATCH /api/availability/[id]  — admin validates or rejects a resubmission
// Body: { action: 'validate' | 'reject' }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { action } = body;

  if (action !== 'validate' && action !== 'reject') {
    return NextResponse.json({ error: "action must be 'validate' or 'reject'" }, { status: 400 });
  }

  const availability = await prisma.availability.findUnique({
    where: { id: params.id },
    include: { lecturer: true },
  });

  if (!availability) {
    return NextResponse.json({ error: 'Availability record not found' }, { status: 404 });
  }

  // Update the resubmission status
  const updated = await prisma.availability.update({
    where: { id: params.id },
    data: { resubmission: action === 'validate' ? 'validated' : 'rejected' },
    include: { lecturer: { select: { id: true, name: true, email: true } } },
  });

  // If validated, regenerate timetable entries for this lecturer only
  if (action === 'validate') {
    const instructorName = availability.lecturer.name;

    // Delete existing timetable entries for this lecturer
    const lecturerCourses = await prisma.course.findMany({
      where: { instructor: instructorName },
    });
    const courseIds = lecturerCourses.map((c) => c.id);

    await prisma.timetable.deleteMany({ where: { courseId: { in: courseIds } } });

    // Build availability map for this lecturer
    const availMap: Record<string, number[]> = {
      Monday: allowedHours(availability.mondayTime),
      Tuesday: allowedHours(availability.tuesdayTime),
      Wednesday: allowedHours(availability.wednesdayTime),
      Thursday: allowedHours(availability.thursdayTime),
      Friday: allowedHours(availability.fridayTime),
      Saturday: allowedHours(availability.saturdayTime),
    };

    // Only include days the lecturer marked as available
    if (!availability.monday) availMap['Monday'] = [];
    if (!availability.tuesday) availMap['Tuesday'] = [];
    if (!availability.wednesday) availMap['Wednesday'] = [];
    if (!availability.thursday) availMap['Thursday'] = [];
    if (!availability.friday) availMap['Friday'] = [];
    if (!availability.saturday) availMap['Saturday'] = [];

    const halls = await prisma.hall.findMany({ include: { building: true } });
    const hallSchedule = new Map<string, Set<string>>();
    const baseDate = getWeekStart();
    const generatedEntries = [];

    for (const course of lecturerCourses) {
      let assigned = false;
      for (let dayIndex = 0; dayIndex < DAYS.length && !assigned; dayIndex++) {
        const day = DAYS[dayIndex];
        const hours = availMap[day] ?? [];
        for (const hour of hours) {
          const slotKey = `${day}-${hour}:00`;
          for (const hall of halls) {
            if (hallSchedule.get(hall.id)?.has(slotKey)) continue;

            const startTime = new Date(baseDate);
            startTime.setUTCDate(baseDate.getUTCDate() + dayIndex);
            startTime.setUTCHours(hour, 0, 0, 0);
            const endTime = new Date(startTime);
            endTime.setUTCHours(hour + 1);

            hallSchedule.set(hall.id, new Set([...(hallSchedule.get(hall.id) || []), slotKey]));
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

    await Promise.all(
      generatedEntries.map((e) =>
        prisma.timetable.create({
          data: { campusId: e.campusId, courseId: e.courseId, hallId: e.hallId, startTime: e.startTime, endTime: e.endTime, day: e.day },
        })
      )
    );

    return NextResponse.json({
      availability: updated,
      regenerated: generatedEntries.length,
      message: `Resubmission validated. Regenerated ${generatedEntries.length} timetable entries for ${instructorName}.`,
    });
  }

  return NextResponse.json({ availability: updated, message: 'Resubmission rejected.' });
}
