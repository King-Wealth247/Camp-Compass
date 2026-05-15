import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdminOrRegistrar(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  return role === 'admin' || role === 'registrar';
}

export async function GET(req: NextRequest) {
  if (!isAdminOrRegistrar(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      department: true,
      level: true,
      courseTaught: true,
      tuitionPaid: true,
      institutionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}
