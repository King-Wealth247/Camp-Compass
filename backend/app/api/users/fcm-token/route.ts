import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST /api/users/fcm-token
// Save an FCM push token for the current user
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let user;
  try {
    user = verifyToken(authHeader.split(' ')[1]);
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Get current tokens
  const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Add token if it doesn't exist
  if (!dbUser.fcmTokens.includes(token)) {
    await prisma.user.update({
      where: { id: user.sub },
      data: {
        fcmTokens: {
          push: token,
        },
      },
    });
  }

  return NextResponse.json({ message: 'FCM token saved successfully' }, { status: 201 });
}
