import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const getUser = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(authHeader.split(' ')[1]);
  } catch (e) {
    return null;
  }
};

// PATCH /api/notifications/[id]
// Mark notification as read
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (notification.userId !== user.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/notifications/[id]
// Delete a notification
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (notification.userId !== user.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await prisma.notification.delete({
    where: { id },
  });

  return NextResponse.json({ message: 'Deleted successfully' });
}
