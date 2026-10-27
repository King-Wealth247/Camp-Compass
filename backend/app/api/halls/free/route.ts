import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/halls/free
 * Returns halls that have no timetable assignment for a given day and/or campus.
 * 
 * Query params:
 *   - day: string (e.g. "Monday") — required
 *   - campusId: string — optional
 *   - date: string (ISO) — optional, used to narrow by week
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get('day');
  const campusId = searchParams.get('campusId');

  if (!day) {
    return NextResponse.json({ error: 'day parameter is required' }, { status: 400 });
  }

  // Get all halls (filtered by campus if specified)
  const allHalls = await prisma.hall.findMany({
    where: {
      isAvailable: true,
      ...(campusId
        ? { building: { campusId } }
        : {}),
    },
    include: {
      building: {
        include: { campus: true },
      },
      floorRef: true,
    },
    orderBy: { name: 'asc' },
  });

  // Get all hall IDs that are booked on that day
  const bookedSubComponents = await prisma.timetableSubComponent.findMany({
    where: { day },
    select: { hallId: true },
  });

  const bookedHallIds = new Set(bookedSubComponents.map((s) => s.hallId));

  // Filter to free halls only
  const freeHalls = allHalls.filter((h) => !bookedHallIds.has(h.id));

  return NextResponse.json({
    day,
    campusId: campusId ?? 'all',
    total: allHalls.length,
    free: freeHalls.length,
    booked: allHalls.length - freeHalls.length,
    freeHalls: freeHalls.map((h) => ({
      id: h.id,
      name: h.name,
      capacity: h.capacity,
      floor: h.floor,
      buildingId: h.buildingId,
      buildingName: h.building.name,
      campusId: h.building.campusId,
      campusName: h.building.campus.name,
    })),
  });
}
