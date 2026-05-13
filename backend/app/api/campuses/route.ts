import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  return req.headers.get('x-user-role') === 'admin';
}

export async function GET() {
  const campuses = await prisma.campus.findMany({
    include: {
      buildings: true,
    },
  });

  return NextResponse.json(campuses);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const campus = await prisma.campus.create({
    data: {
      name: body.name,
      city: body.city,
      region: body.region,
      latitude: body.latitude,
      longitude: body.longitude,
      institutionId: body.institutionId,
    },
    include: {
      buildings: true,
    },
  });

  return NextResponse.json(campus);
}
