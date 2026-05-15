import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyToken } from '@/lib/auth';

function slugForEmailSegment(raw: string): string {
  const base = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  return base.length > 0 ? base : 'user';
}

function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 14; i += 1) {
    out += chars[randomInt(chars.length)];
  }
  return out;
}

type RegistrarBody =
  | {
      role: 'student';
      name: string;
      phone: string;
      institutionId: string;
      department: string;
      level: string;
      tuitionFullyPaid: boolean;
    }
  | {
      role: 'staff';
      name: string;
      phone: string;
      institutionId: string;
      department: string;
      courseTaught: string;
    };

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tokenPayload: { sub: string; role: string };
  try {
    tokenPayload = verifyToken(authHeader.split(' ')[1]);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (tokenPayload.role !== 'registrar' && tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as RegistrarBody;

  if (!body || (body.role !== 'student' && body.role !== 'staff')) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const institutionId = typeof body.institutionId === 'string' ? body.institutionId.trim() : '';
  const department = typeof body.department === 'string' ? body.department.trim() : '';

  if (!name || !phone || !institutionId || !department) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 400 });
  }

  const instSlug = slugForEmailSegment(institution.name);
  const nameSlug = slugForEmailSegment(name);

  let level: string | null = null;
  let tuitionPaid = false;
  let courseTaught: string | null = null;

  if (body.role === 'student') {
    level = typeof body.level === 'string' ? body.level.trim() : '';
    if (!level) {
      return NextResponse.json({ error: 'Level is required for students' }, { status: 400 });
    }
    if (typeof body.tuitionFullyPaid !== 'boolean') {
      return NextResponse.json({ error: 'Tuition status is required' }, { status: 400 });
    }
    tuitionPaid = body.tuitionFullyPaid;
  } else {
    courseTaught = typeof body.courseTaught === 'string' ? body.courseTaught.trim() : '';
    if (!courseTaught) {
      return NextResponse.json({ error: 'Course taught is required for staff' }, { status: 400 });
    }
  }

  const plainPassword = generatePassword();
  const hashedPassword = await hashPassword(plainPassword);

  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const suffix = randomInt(10_000, 100_000);
    const email = `${nameSlug}${suffix}@${instSlug}.edu`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      continue;
    }

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: body.role,
          department,
          level,
          courseTaught,
          tuitionPaid,
          institutionId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          level: true,
          courseTaught: true,
          tuitionPaid: true,
          institutionId: true,
          phone: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        ...user,
        generatedPassword: plainPassword,
      });
    } catch (e: unknown) {
      const code = typeof e === 'object' && e !== null && 'code' in e ? (e as { code?: string }).code : undefined;
      if (code === 'P2002') {
        continue;
      }
      throw e;
    }
  }

  return NextResponse.json({ error: 'Could not allocate a unique email' }, { status: 503 });
}
