import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  return req.headers.get('x-user-role') === 'admin';
}

export async function GET() {
  const buildings = await prisma.building.findMany({
    include: {
      campus: true,
    },
  });

  return NextResponse.json(buildings);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const building = await prisma.building.create({
    data: {
      name: body.name,
      code: body.code,
      campusId: body.campusId,
      floors: body.floors ?? 1,
      latitude: body.latitude,
      longitude: body.longitude,
    },
    include: {
      campus: true,
    },
  });

  return NextResponse.json(building);
}
