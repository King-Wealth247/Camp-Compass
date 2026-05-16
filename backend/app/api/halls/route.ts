import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const halls = await prisma.hall.findMany({
    include: {
      building: {
        include: {
          campus: true,
        },
      },
    },
  });

  return NextResponse.json(halls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hall = await prisma.hall.create({
    data: {
      name: body.name,
      capacity: body.capacity,
      floorId: body.floorId,
      floor: body.floor !== undefined ? parseInt(body.floor) : undefined,
      buildingId: body.buildingId,
      isAvailable: body.isAvailable ?? body.available ?? true,
    },
    include: {
      building: {
        include: {
          campus: true,
        },
      },
    },
  });
  return NextResponse.json(hall);
}
