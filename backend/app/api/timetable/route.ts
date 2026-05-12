import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const department = req.nextUrl.searchParams.get('department');
  const level = req.nextUrl.searchParams.get('level');
  const instructor = req.nextUrl.searchParams.get('instructor');

  let where: any = undefined;

  if (department || level || instructor) {
    where = { course: {} };

    if (department) {
      where.course.department = department;
    }

    if (level) {
      where.course.level = level;
    }

    if (instructor) {
      where.course.instructor = instructor;
    }
  }

  const timetables = await prisma.timetable.findMany({
    where,
    include: {
      course: true,
      hall: { include: { building: { include: { campus: true } } } },
      campus: true,
    },
  });

  return NextResponse.json(timetables);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const timetable = await prisma.timetable.create({
    data: {
      campusId: body.campusId,
      courseId: body.courseId,
      hallId: body.hallId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
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
