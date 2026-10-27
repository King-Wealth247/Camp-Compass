import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

/**
 * POST /api/timetable/publish
 * Publishes a draft timetable (or rolls back to a previous published version).
 *
 * Body:
 *   - timetableId: string   — ID of the draft timetable to publish
 *   - publishedBy: string   — user ID of the admin publishing
 *
 * POST /api/timetable/publish/rollback (handled via action)
 *   - action: "rollback"    — restores the most recent archived/published version
 *   - levelId: string       — the level whose timetable to roll back
 *   - departmentId: string  — the department
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, timetableId, publishedBy, levelId, departmentId } = body;

  // ── ROLLBACK ─────────────────────────────────────────────────────────────
  if (action === 'rollback') {
    if (!levelId || !departmentId) {
      return NextResponse.json({ error: 'levelId and departmentId required for rollback' }, { status: 400 });
    }

    // Find the most recently archived timetable for this level
    const previousVersion = await prisma.timetable.findFirst({
      where: { levelId, departmentId, status: 'archived' },
      orderBy: { publishedAt: 'desc' },
      include: { subComponents: true },
    });

    if (!previousVersion) {
      return NextResponse.json({ error: 'No archived version found to roll back to.' }, { status: 404 });
    }

    // Archive the current published version
    await prisma.timetable.updateMany({
      where: { levelId, departmentId, status: 'published' },
      data: { status: 'archived' },
    });

    // Re-publish the archived version
    await prisma.timetable.update({
      where: { id: previousVersion.id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        publishedBy: publishedBy ?? 'system',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rolled back to timetable from ${previousVersion.publishedAt?.toISOString() ?? 'previous version'}.`,
      timetableId: previousVersion.id,
    });
  }

  // ── PUBLISH ───────────────────────────────────────────────────────────────
  if (!timetableId) {
    return NextResponse.json({ error: 'timetableId is required' }, { status: 400 });
  }

  const draft = await prisma.timetable.findUnique({
    where: { id: timetableId },
    include: { department: true, subComponents: true },
  });

  if (!draft) {
    return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
  }

  if (draft.status === 'published') {
    return NextResponse.json({ error: 'This timetable is already published.' }, { status: 409 });
  }

  // Archive any currently published timetable for this level
  await prisma.timetable.updateMany({
    where: {
      levelId: draft.levelId,
      departmentId: draft.departmentId,
      status: 'published',
      id: { not: timetableId },
    },
    data: { status: 'archived' },
  });

  // Publish the draft
  const published = await prisma.timetable.update({
    where: { id: timetableId },
    data: {
      status: 'published',
      publishedAt: new Date(),
      publishedBy: publishedBy ?? 'system',
    },
  });

  // Notify all users in this department/level
  try {
    const affectedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { departmentId: draft.departmentId, levelId: draft.levelId },
          { role: { in: ['staff', 'admin'] } },
        ],
      },
      select: { id: true, fcmTokens: true },
    });

    const title = '📅 Timetable Published';
    const message = `${draft.department.departmentName} Level ${draft.level} timetable has been published.`;

    await prisma.notification.createMany({
      data: affectedUsers.map((u) => ({ userId: u.id, title, message, type: 'info' })),
    });

    const tokens = affectedUsers.flatMap((u) => u.fcmTokens).filter(Boolean);
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, message, { type: 'timetable_published' });
    }
  } catch (e) {
    console.error('Notification error on publish:', e);
  }

  return NextResponse.json({
    success: true,
    message: `Timetable for ${draft.department.departmentName} Level ${draft.level} published successfully.`,
    timetableId: published.id,
    publishedAt: published.publishedAt,
  });
}

/**
 * GET /api/timetable/publish
 * Returns publication status for all timetables (for admin dashboard).
 */
export async function GET() {
  const timetables = await prisma.timetable.findMany({
    select: {
      id: true,
      level: true,
      status: true,
      generationMode: true,
      publishedAt: true,
      publishedBy: true,
      createdAt: true,
      department: { select: { departmentName: true } },
      _count: { select: { subComponents: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(timetables);
}
