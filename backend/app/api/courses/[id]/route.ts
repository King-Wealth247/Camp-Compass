import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      code: body.code,
      title: body.title,
      department: body.department,
      level: body.level,
      instructor: body.instructor,
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Course deleted successfully' });
}
