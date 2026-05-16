import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/requireAdmin';

/**
 * GET /api/admin/buildings?limit=10&offset=0
 */
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

  const [total, buildings] = await Promise.all([
    prisma.building.count(),
    prisma.building.findMany({
      skip: offset,
      take: limit,
      include: { campus: true, halls: true },
    }),
  ]);

  return NextResponse.json({ total, limit, offset, data: buildings });
}

/**
 * POST /api/admin/buildings
 */
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;
  const payload = await req.json();
  const building = await prisma.building.create({ data: payload as any });
  return NextResponse.json(building, { status: 201 });
}

/**
 * PUT /api/admin/buildings/:id
 */
export async function PUT(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'Missing building id' }, { status: 400 });
  const payload = await req.json();
  const updated = await prisma.building.update({ where: { id }, data: payload as any });
  return NextResponse.json(updated);
}

/**
 * DELETE /api/admin/buildings/:id
 */
export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.status !== 200) return adminCheck;
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'Missing building id' }, { status: 400 });
  await prisma.building.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
