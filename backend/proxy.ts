import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/** CORS for browser clients (e.g. web app on :3000 calling API on :3001). Must answer OPTIONS before auth checks. */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Max-Age': '86400',
} as const;

function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// Routes that don't require authentication
const publicRoutes = ['/api/auth/login', '/api/health'];

// Role-based route access control
const roleBasedRoutes: Record<string, string[]> = {
  admin: [
    '/api/admin',
    '/api/halls',
    '/api/campuses',
    '/api/buildings',
    '/api/timetable',
    '/api/users',
    '/api/auth/register',
    '/api/institutions',
  ],
  registrar: [
    '/api/registrar',
    '/api/users',
    '/api/campuses',
    '/api/buildings',
    '/api/halls',
    '/api/auth/register',
    '/api/institutions',
  ],
  staff: ['/api/staff', '/api/timetable', '/api/campuses', '/api/buildings', '/api/halls', '/api/users'],
  student: ['/api/student', '/api/timetable', '/api/campuses', '/api/buildings', '/api/halls', '/api/users'],
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
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
      return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
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
    return withCors(NextResponse.json({ error: 'Invalid token' }, { status: 401 }));
  }
}

// Configure which routes to apply middleware to
export const config = {
  matcher: ['/api/:path*'],
};
