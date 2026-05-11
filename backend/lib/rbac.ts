import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export type Permission = 'read' | 'write' | 'delete' | 'admin';

export const rolePermissions: Record<UserRole, Permission[]> = {
  student: ['read'],
  staff: ['read', 'write'],
  registrar: ['read', 'write', 'admin'],
  admin: ['read', 'write', 'delete', 'admin'],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAccessResource(role: UserRole, resourceType: string): boolean {
  // Admin can access everything
  if (role === 'admin') return true;

  // Role-specific access rules
  const accessRules: Record<UserRole, string[]> = {
    admin: ['*'],
    registrar: ['users', 'institutions', 'campuses'],
    staff: ['timetable', 'availability', 'profile'],
    student: ['timetable', 'profile', 'map'],
  };

  const allowedResources = accessRules[role] || [];
  return allowedResources.includes('*') || allowedResources.includes(resourceType);
}

export function requireRole(...roles: UserRole[]) {
  return (req: NextRequest) => {
    const userRole = req.headers.get('x-user-role') as UserRole;
    if (!roles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return null;
  };
}

export function requirePermission(permission: Permission) {
  return (req: NextRequest) => {
    const userRole = req.headers.get('x-user-role') as UserRole;
    if (!hasPermission(userRole, permission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return null;
  };
}
