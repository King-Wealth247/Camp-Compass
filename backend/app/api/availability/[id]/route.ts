import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

// Map availability time range string to allowed start hours
function allowedHours(timeRange: string | null): number[] {
  if (!timeRange) return [];
  if (timeRange === '08:00-12:00') return [8, 9, 10, 11];
  if (timeRange === '13:00-17:00') return [13, 14, 15, 16];
  if (timeRange === '08:00-17:00') return [8, 9, 10, 11, 13, 14, 15, 16];
  return [];
}

function getWeekStart() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

// PATCH /api/availability/[id]  — admin validates or rejects a resubmission
// Body: { action: 'validate' | 'reject' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  if (action !== 'validate' && action !== 'reject') {
    return NextResponse.json({ error: "action must be 'validate' or 'reject'" }, { status: 400 });
  }

  const availability = await prisma.availability.findUnique({
    where: { id },
    include: { lecturer: true },
  });

  if (!availability) {
    return NextResponse.json({ error: 'Availability record not found' }, { status: 404 });
  }

  // Update the resubmission status
  const updated = await prisma.availability.update({
    where: { id },
    data: { resubmission: action === 'validate' ? 'validated' : 'rejected' },
    include: { lecturer: { select: { id: true, name: true, email: true } } },
  });

  // If validated, prompt the admin to regenerate the timetable
  if (action === 'validate') {
    return NextResponse.json({
      availability: updated,
      message: `Resubmission validated for ${availability.lecturer.name}. Please regenerate the timetables to apply changes.`,
    });
  }

  return NextResponse.json({ availability: updated, message: 'Resubmission rejected.' });
}
