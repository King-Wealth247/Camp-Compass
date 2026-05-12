import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campus = await prisma.campus.findUnique({
    where: { id: params.id },
    include: {
      institution: true,
      buildings: true,
    },
  });

  if (!campus) {
    return NextResponse.json({ error: 'Campus not found' }, { status: 404 });
  }

  return NextResponse.json(campus);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const campus = await prisma.campus.update({
    where: { id: params.id },
    data: {
      name: body.name,
      institutionId: body.institutionId,
    },
  });

  return NextResponse.json(campus);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.campus.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Campus deleted successfully' });
}
