import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        institution: true,
        mainCampus: true,
        levels: true,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const department = await prisma.department.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
