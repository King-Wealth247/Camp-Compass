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

    // Map Bytes back to base64 string for the frontend
    const mappedFloors = floors.map(floor => ({
      ...floor,
      floorPlan: floor.floorPlan ? `data:image/jpeg;base64,${floor.floorPlan.toString('base64')}` : null,
    }));

    return NextResponse.json(mappedFloors);
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

    // Convert base64 string to Buffer for Prisma Bytes type
    let floorPlanBytes = null;
    if (floorPlan) {
      // Remove data URL prefix if present
      const base64Data = floorPlan.includes(',') ? floorPlan.split(',')[1] : floorPlan;
      floorPlanBytes = Buffer.from(base64Data, 'base64');
    }

    const floor = await prisma.floor.create({
      data: {
        buildingId,
        floorNum: parseInt(floorNum),
        floorPlan: floorPlanBytes,
      },
    });

    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create floor' }, { status: 500 });
  }
}
