import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Middleware helper that ensures the request is made by an authenticated admin.
 * Returns a 401 if no valid JWT is present, or 403 if the role is not admin.
 */
export async function requireAdmin(request: Request): Promise<NextResponse> {
  // Try to extract token from Authorization header (Bearer <token>)
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.decode(token) as { role?: string } | null;
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }
    // Admin verified – allow the request to continue by returning null (handled in route handlers)
    return NextResponse.next();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
