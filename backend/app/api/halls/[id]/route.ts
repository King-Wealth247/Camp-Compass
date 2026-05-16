import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hall = await prisma.hall.findUnique({
    where: { id },
    include: {
      building: {
        include: {
          campus: true,
        },
      },
    },
  });

  if (!hall) {
    return NextResponse.json({ error: 'Hall not found' }, { status: 404 });
  }

  return NextResponse.json(hall);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updatedHall = await prisma.hall.update({
    where: { id },
    data: {
      name: body.name,
      capacity: body.capacity,
      floorId: body.floorId,
      floor: body.floor !== undefined ? parseInt(body.floor) : undefined,
      buildingId: body.buildingId,
      isAvailable: body.isAvailable ?? body.available,
    },
    include: {
      building: {
        include: {
          campus: true,
        },
      },
    },
  });

  return NextResponse.json(updatedHall);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.hall.delete({ where: { id } });
  return NextResponse.json({ message: 'Hall deleted successfully' });
}
