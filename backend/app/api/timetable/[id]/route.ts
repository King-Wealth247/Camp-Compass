import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const timetable = await prisma.timetable.findUnique({
    where: { id: params.id },
    include: {
      course: true,
      hall: { include: { building: { include: { campus: true } } } },
      campus: true,
    },
  });

  if (!timetable) {
    return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
  }

  return NextResponse.json(timetable);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const timetable = await prisma.timetable.update({
    where: { id: params.id },
    data: {
      campusId: body.campusId,
      courseId: body.courseId,
      hallId: body.hallId,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      day: body.day,
    },
    include: {
      course: true,
      hall: { include: { building: { include: { campus: true } } } },
      campus: true,
    },
  });

  return NextResponse.json(timetable);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.timetable.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Timetable entry deleted successfully' });
}
