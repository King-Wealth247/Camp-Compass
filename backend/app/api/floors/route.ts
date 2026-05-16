import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get('buildingId');

    const where = buildingId ? { buildingId } : {};

    const floors = await prisma.floor.findMany({
      where,
      include: {
        building: true,
      },
    });

    return NextResponse.json(floors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch floors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buildingId, floorNum, floorPlan } = body;

    if (!buildingId || floorNum === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const floor = await prisma.floor.create({
      data: {
        buildingId,
        floorNum: parseInt(floorNum),
        floorPlan,
      },
    });

    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create floor' }, { status: 500 });
  }
}
