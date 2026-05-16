import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendPushNotification } from '@/lib/firebase-admin';

// Helper to get authenticated user
const getUser = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(authHeader.split(' ')[1]);
  } catch (e) {
    return null;
  }
};

// GET /api/notifications
// Fetch notifications for the logged-in user
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: user.sub },
        { broadcast: true },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}

// POST /api/notifications
// Admin endpoint to broadcast a notification to all users or specific roles
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, message, type = 'info', targetRole } = await req.json();

  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
  }

  // Find target users
  const users = await prisma.user.findMany({
    where: targetRole ? { role: targetRole } : undefined,
    select: { id: true, fcmTokens: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ message: 'No users found for broadcast' });
  }

  // Create notifications in DB and mark them as broadcast messages
  const notificationsData = users.map((u) => ({
    userId: u.id,
    title,
    message,
    type,
    broadcast: true,
  }));

  await prisma.notification.createMany({
    data: notificationsData,
  });

  // Collect all FCM tokens
  const allTokens = users.flatMap((u) => u.fcmTokens).filter(Boolean);

  // Send Push Notifications
  if (allTokens.length > 0) {
    await sendPushNotification(allTokens, title, message, { type });
  }

  return NextResponse.json({ message: `Broadcast sent to ${users.length} users.` }, { status: 201 });
}
