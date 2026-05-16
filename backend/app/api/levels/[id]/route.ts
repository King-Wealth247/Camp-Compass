import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json(level);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch level' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    if (body.level !== undefined) {
      body.level = parseInt(body.level);
    }
    
    const level = await prisma.level.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(level);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update level' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.level.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete level' }, { status: 500 });
  }
}
