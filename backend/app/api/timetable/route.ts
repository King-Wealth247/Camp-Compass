import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const departmentId = req.nextUrl.searchParams.get('departmentId');
  const levelId = req.nextUrl.searchParams.get('levelId');
  const instructor = req.nextUrl.searchParams.get('instructor');

  const where: any = {};

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (levelId) {
    where.levelId = levelId;
  }

  if (instructor) {
    where.subComponents = {
      some: {
        instructor: instructor
      }
    };
  }

  const timetables = await prisma.timetable.findMany({
    where,
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
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json(timetables);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const timetable = await prisma.timetable.create({
    data: {
      departmentId: body.departmentId,
      levelId: body.levelId,
      level: parseInt(body.level),
      subComponents: {
        create: body.subComponents?.map((sub: any) => ({
          courseId: sub.courseId,
          course: sub.course,
          instructor: sub.instructor,
          hallId: sub.hallId,
          hall: sub.hall,
          floor: sub.floor !== undefined ? parseInt(sub.floor) : null,
          startTime: new Date(sub.startTime),
          endTime: new Date(sub.endTime),
          day: sub.day
        })) || []
      }
    },
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

  return NextResponse.json(timetable);
}
