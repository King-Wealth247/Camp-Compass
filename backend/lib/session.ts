import { UserRole } from '@prisma/client';

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function createSession(userId: string, email: string, role: UserRole): Session {
  const now = Date.now();
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN?.replace('h', '') || '1', 10) * 3600 * 1000;

  return {
    userId,
    email,
    role,
    issuedAt: now,
    expiresAt: now + expiresIn,
  };
}

export function isSessionValid(session: Session): boolean {
  return Date.now() < session.expiresAt;
}

export function getSessionTimeRemaining(session: Session): number {
  const remaining = session.expiresAt - Date.now();
  return Math.max(0, remaining);
}
