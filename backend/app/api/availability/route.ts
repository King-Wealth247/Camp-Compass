import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/availability?lecturerId=xxx  — fetch all or by lecturer
export async function GET(req: NextRequest) {
  const lecturerId = req.nextUrl.searchParams.get('lecturerId');

  const records = await prisma.availability.findMany({
    where: lecturerId ? { lecturerId } : undefined,
    include: { lecturer: { select: { id: true, name: true, email: true } } },
    orderBy: { submissionDate: 'desc' },
  });

  return NextResponse.json(records);
}

// POST /api/availability  — submit or resubmit availability
// Body: { lecturerId, monday, mondayTime, tuesday, tuesdayTime, ..., saturday, saturdayTime, description? }
// If a record already exists for this lecturer this week, it's treated as a resubmission.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    lecturerId, monday, mondayTime, tuesday, tuesdayTime,
    wednesday, wednesdayTime, thursday, thursdayTime,
    friday, fridayTime, saturday, saturdayTime, description,
  } = body;

  if (!lecturerId) {
    return NextResponse.json({ error: 'lecturerId is required' }, { status: 400 });
  }

  // Determine if this is a weekend submission or a mid-week resubmission
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check if a submission already exists for this lecturer in the current week
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  weekStart.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.availability.findFirst({
    where: {
      lecturerId,
      submissionDate: { gte: weekStart },
    },
    orderBy: { submissionDate: 'desc' },
  });

  const data = {
    lecturerId,
    monday: Boolean(monday),
    mondayTime: mondayTime ?? null,
    tuesday: Boolean(tuesday),
    tuesdayTime: tuesdayTime ?? null,
    wednesday: Boolean(wednesday),
    wednesdayTime: wednesdayTime ?? null,
    thursday: Boolean(thursday),
    thursdayTime: thursdayTime ?? null,
    friday: Boolean(friday),
    fridayTime: fridayTime ?? null,
    saturday: Boolean(saturday),
    saturdayTime: saturdayTime ?? null,
    description: description ?? null,
    // If there's already a submission this week and it's not the weekend, mark as resubmission
    resubmission: (existing && !isWeekend) ? 'unseen' as const : null,
    submissionDate: now,
  };

  const record = await prisma.availability.create({ data, include: { lecturer: { select: { id: true, name: true, email: true } } } });
  return NextResponse.json(record, { status: 201 });
}
