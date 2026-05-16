import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const timetable = await prisma.timetable.findUnique({
    where: { id },
    include: {
      department: true,
      levelRef: true,
      subComponents: {
        include: {
          courseRef: true,
          hallRef: { include: { building: { include: { campus: true } } } }
        }
      }
    },
  });

  if (!timetable) {
    return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
  }

  return NextResponse.json(timetable);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  // For PUT, usually you'd update specific properties or replace subcomponents.
  // For simplicity, we just update the root fields here. 
  // Updating subcomponents requires deletion/re-creation or matching by ID.
  const timetable = await prisma.timetable.update({
    where: { id },
    data: {
      departmentId: body.departmentId,
      levelId: body.levelId,
      level: body.level !== undefined ? parseInt(body.level) : undefined,
    },
    include: {
      department: true,
      levelRef: true,
      subComponents: true,
    },
  });

  return NextResponse.json(timetable);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // SubComponents have onDelete: Cascade, so deleting the Timetable deletes them.
  await prisma.timetable.delete({ where: { id } });
  return NextResponse.json({ message: 'Timetable entry deleted successfully' });
}
