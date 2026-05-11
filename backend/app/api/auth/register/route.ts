import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, role, institutionId } = body;

  if (!email || !password || !name || !institutionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role ?? 'student',
      institutionId,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
