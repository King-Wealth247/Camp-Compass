import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'replace-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { sub: string; role: string };
}
