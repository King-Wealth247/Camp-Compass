import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/requireAdmin';

/**
 * GET /api/admin/campuses?limit=10&offset=0
 * Returns a paginated list of campuses.
 */
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

  const [total, campuses] = await Promise.all([
    prisma.campus.count(),
    prisma.campus.findMany({
      skip: offset,
      take: limit,
      include: { institution: true, buildings: true },
    }),
  ]);

  return NextResponse.json({ total, limit, offset, data: campuses });
}

/**
 * POST /api/admin/campuses
 * Body: { name, city?, region?, latitude?, longitude?, institutionId }
 */
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;

  const body = await req.json();
  const { name, city, region, latitude, longitude, institutionId } = body;
  if (!name || !institutionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const campus = await prisma.campus.create({
    data: {
      name,
      city,
      region,
      latitude,
      longitude,
      institutionId,
    },
    include: { institution: true, buildings: true },
  });
  return NextResponse.json(campus, { status: 201 });
}
