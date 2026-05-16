import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { code: 'asc' },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      code: body.code,
      title: body.title,
      departmentId: body.departmentId,
      department: body.department,
      levelId: body.levelId,
      level: parseInt(body.level),
      instructorId: body.instructorId,
      instructor: body.instructor,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
