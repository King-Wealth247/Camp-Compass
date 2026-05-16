import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  return req.headers.get('x-user-role') === 'admin';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      campus: true,
      halls: true,
    },
  });

  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 });
  }

  return NextResponse.json(building);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const building = await prisma.building.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code,
      floors: body.floors,
      latitude: body.latitude,
      longitude: body.longitude,
    },
    include: {
      campus: true,
      halls: true,
    },
  });

  return NextResponse.json(building);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.building.delete({ where: { id } });
  return NextResponse.json({ message: 'Building deleted successfully' });
}
