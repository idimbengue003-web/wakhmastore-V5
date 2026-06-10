import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Use fallback only during build time; runtime must have the real secret
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
if (!JWT_SECRET && process.env.NODE_ENV === 'production' && !isBuildTime) {
  console.warn(
    'WARNING: JWT_SECRET is not set. Using insecure fallback. ' +
    'Set JWT_SECRET in your Vercel environment variables.'
  );
}

// Fallback for development / build time only
const SECRET = JWT_SECRET || 'wakhma-store-dev-secret-key-not-for-production';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string; email: string; role: string };
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
