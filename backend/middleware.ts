import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];

// Role-based route access control
const roleBasedRoutes: Record<string, string[]> = {
  admin: ['/api/admin', '/api/halls', '/api/campuses', '/api/buildings', '/api/timetable'],
  registrar: ['/api/registrar', '/api/users', '/api/campuses', '/api/buildings', '/api/halls'],
  staff: ['/api/staff', '/api/timetable', '/api/campuses', '/api/buildings', '/api/halls'],
  student: ['/api/student', '/api/timetable', '/api/campuses', '/api/buildings', '/api/halls'],
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);

    // Check role-based access
    const userRole = payload.role as string;
    const allowedRoutes = roleBasedRoutes[userRole] || [];

    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route)) ||
                      pathname === '/api/auth/me';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add user info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-role', userRole);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Configure which routes to apply middleware to
export const config = {
  matcher: ['/api/:path*'],
};
