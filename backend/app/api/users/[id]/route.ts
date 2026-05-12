import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      level: true,
      tuitionPaid: true,
      institutionId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const updateData: any = {
    email: body.email,
    name: body.name,
    role: body.role,
    department: body.department,
    level: body.level,
    tuitionPaid: body.tuitionPaid,
    institutionId: body.institutionId,
  };

  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      level: true,
      tuitionPaid: true,
      institutionId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'User deleted successfully' });
}
