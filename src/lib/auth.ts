import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Use fallback during build time or development; fail hard in production runtime
const isBuildTime = typeof window === 'undefined' && (
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV !== 'production'
);

const SECRET: string = JWT_SECRET || (isBuildTime ? 'wakhma-store-dev-secret-key-not-for-production' : '');

if (!SECRET && process.env.NODE_ENV === 'production' && !isBuildTime) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Set it in your Vercel environment variables before deploying.'
  );
}

const JWT_SIGN_SECRET: string = SECRET || 'wakhma-store-dev-fallback';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SIGN_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SIGN_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'WK-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
