import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || !userRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Users can access their own profile, admins and registrars can access any
  if (userId !== id && !['admin', 'registrar'].includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      departmentId: true,
      department: true,
      levelId: true,
      level: true,
      regEmail: true,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || !userRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Users can update their own profile, admins and registrars can update any
  if (userId !== id && !['admin', 'registrar'].includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const updateData: any = {
    email: body.email,
    name: body.name,
    phone: body.phone,
    role: body.role,
    departmentId: body.departmentId,
    department: body.department,
    levelId: body.levelId,
    level: body.level !== undefined ? parseInt(body.level) : undefined,
    regEmail: body.regEmail,
    tuitionPaid: body.tuitionPaid,
    institutionId: body.institutionId,
  };

  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      departmentId: true,
      department: true,
      levelId: true,
      level: true,
      regEmail: true,
      tuitionPaid: true,
      institutionId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: 'User deleted successfully' });
}
