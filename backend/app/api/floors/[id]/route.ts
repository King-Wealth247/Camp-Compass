import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        building: true,
        halls: true,
      },
    });

    if (!floor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }

    const mappedFloor = {
      ...floor,
      floorPlan: floor.floorPlan ? `data:image/jpeg;base64,${floor.floorPlan.toString('base64')}` : null,
    };

    return NextResponse.json(mappedFloor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch floor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    if (body.floorNum !== undefined) {
      body.floorNum = parseInt(body.floorNum);
    }
    
    if (body.floorPlan) {
      const base64Data = body.floorPlan.includes(',') ? body.floorPlan.split(',')[1] : body.floorPlan;
      body.floorPlan = Buffer.from(base64Data, 'base64');
    }
    
    const floor = await prisma.floor.update({
      where: { id },
      data: body,
    });

    const mappedFloor = {
      ...floor,
      floorPlan: floor.floorPlan ? `data:image/jpeg;base64,${floor.floorPlan.toString('base64')}` : null,
    };

    return NextResponse.json(mappedFloor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update floor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.floor.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Floor deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete floor' }, { status: 500 });
  }
}
