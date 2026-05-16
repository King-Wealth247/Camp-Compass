import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');

    const where = departmentId ? { departmentId } : {};

    const levels = await prisma.level.findMany({
      where,
      include: {
        department: true,
      },
    });

    return NextResponse.json(levels);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, level } = body;

    if (!departmentId || level === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newLevel = await prisma.level.create({
      data: {
        departmentId,
        level: parseInt(level),
      },
    });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create level' }, { status: 500 });
  }
}
