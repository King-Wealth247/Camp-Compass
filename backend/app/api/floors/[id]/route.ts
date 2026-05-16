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

    return NextResponse.json(floor);
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
    
    const floor = await prisma.floor.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(floor);
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
