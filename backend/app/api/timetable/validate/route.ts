import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/timetable/validate
 * Validates an existing or proposed timetable for conflicts.
 * 
 * Body (optional):
 *   - timetableId: string — validate a specific timetable
 *   - departmentId: string — validate all timetables in a department
 *   - levelId: string — validate a specific level
 *   (if none provided, validates ALL timetables)
 * 
 * Returns:
 *   - valid: boolean
 *   - conflicts: array of conflict descriptions
 *   - warnings: array of warning messages
 *   - stats: { total, conflicted }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { timetableId, departmentId, levelId } = body;

  // Build filter
  const timetableWhere: any = {};
  if (timetableId) timetableWhere.id = timetableId;
  if (departmentId) timetableWhere.departmentId = departmentId;
  if (levelId) timetableWhere.levelId = levelId;

  // Load all relevant sub-components
  const timetables = await prisma.timetable.findMany({
    where: Object.keys(timetableWhere).length ? timetableWhere : undefined,
    include: {
      subComponents: {
        include: {
          hallRef: { include: { building: { include: { campus: true } } } },
          courseRef: true,
        },
      },
      department: true,
    },
  });

  const allSubs = timetables.flatMap((tt) =>
    tt.subComponents.map((s) => ({ ...s, timetable: tt }))
  );

  const conflicts: string[] = [];
  const warnings: string[] = [];

  // Check 1: Hall double-booking (same hall, same day, overlapping times)
  for (let i = 0; i < allSubs.length; i++) {
    for (let j = i + 1; j < allSubs.length; j++) {
      const a = allSubs[i];
      const b = allSubs[j];

      if (a.hallId !== b.hallId || a.day !== b.day) continue;

      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      if (aStart < bEnd && bStart < aEnd) {
        conflicts.push(
          `Hall conflict: "${a.hall}" on ${a.day} between ` +
          `"${a.timetable.department.departmentName}" (${new Date(aStart).toISOString().slice(11, 16)}-${new Date(aEnd).toISOString().slice(11, 16)}) ` +
          `and "${b.timetable.department.departmentName}" (${new Date(bStart).toISOString().slice(11, 16)}-${new Date(bEnd).toISOString().slice(11, 16)})`
        );
      }
    }
  }

  // Check 2: Instructor double-booking (same instructor, same day, overlapping times)
  for (let i = 0; i < allSubs.length; i++) {
    for (let j = i + 1; j < allSubs.length; j++) {
      const a = allSubs[i];
      const b = allSubs[j];

      if (a.instructor !== b.instructor || a.day !== b.day || a.courseId === b.courseId) continue;

      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      if (aStart < bEnd && bStart < aEnd) {
        conflicts.push(
          `Instructor conflict: "${a.instructor}" is double-booked on ${a.day} ` +
          `(${new Date(aStart).toISOString().slice(11, 16)}-${new Date(aEnd).toISOString().slice(11, 16)})`
        );
      }
    }
  }

  // Check 3: Same level double-booked at same time
  for (let i = 0; i < allSubs.length; i++) {
    for (let j = i + 1; j < allSubs.length; j++) {
      const a = allSubs[i];
      const b = allSubs[j];

      if (
        a.timetable.levelId !== b.timetable.levelId ||
        a.timetable.departmentId !== b.timetable.departmentId ||
        a.day !== b.day
      ) continue;

      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      if (aStart < bEnd && bStart < aEnd) {
        conflicts.push(
          `Level conflict: "${a.timetable.department.departmentName} Level ${a.timetable.level}" has two classes at the same time on ${a.day}`
        );
      }
    }
  }

  // Warning: Free hall guarantee
  const campuses = await prisma.campus.findMany({ select: { id: true, name: true } });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  for (const campus of campuses) {
    const campusHalls = await prisma.hall.count({
      where: { isAvailable: true, building: { campusId: campus.id } },
    });

    for (const day of days) {
      const bookedCount = await prisma.timetableSubComponent.count({
        where: {
          day,
          hallRef: { building: { campusId: campus.id } },
        },
      });

      // Warn if all halls are booked (none free)
      if (bookedCount >= campusHalls && campusHalls > 0) {
        warnings.push(
          `No free hall on ${campus.name} campus on ${day}. All ${campusHalls} hall(s) are booked.`
        );
      }
    }
  }

  const conflictsDeduped = [...new Set(conflicts)];
  const warningsDeduped = [...new Set(warnings)];

  return NextResponse.json({
    valid: conflictsDeduped.length === 0,
    conflicts: conflictsDeduped,
    warnings: warningsDeduped,
    stats: {
      timetablesChecked: timetables.length,
      subComponentsChecked: allSubs.length,
      conflictCount: conflictsDeduped.length,
      warningCount: warningsDeduped.length,
    },
  });
}
