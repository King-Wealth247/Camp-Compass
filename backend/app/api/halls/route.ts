import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const halls = await prisma.hall.findMany({ include: { building: true } });
  return NextResponse.json(halls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hall = await prisma.hall.create({
    data: {
      name: body.name,
      capacity: body.capacity,
      buildingId: body.buildingId,
    },
  });
  return NextResponse.json(hall);
}
