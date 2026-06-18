import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ============================================================================
// 🔐 GESTION DU JWT_SECRET — sécurisée (pas de fallback hardcoded)
// ============================================================================
//
// Règles :
// - En runtime production (NODE_ENV=production) : JWT_SECRET OBLIGATOIRE.
//   Si manquant → throw au module load (build fails / runtime crash) plutôt
//   que d'utiliser un secret dev qui compromettrait tous les tokens.
// - En dev/test/build : on autorise un secret dev pour ne pas casser `next
//   build` et les tests locaux, mais on log un warning visible.
// - On vérifie aussi que le secret fait au moins 32 caractères (256 bits) —
//   secret faible = JWT forgeable.
// - On vérifie que le secret n'est pas le secret dev connu publiquement
//   (au cas où quelqu'un copierait le code sans le changer).
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET;

const DEV_SECRET = 'wakhma-store-dev-secret-key-not-for-production';
const isBuildTime =
  typeof window === 'undefined' &&
  (process.env.NEXT_PHASE === 'phase-production-build' ||
   process.env.NODE_ENV !== 'production');

const isProdRuntime =
  typeof window === 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build';

if (isProdRuntime) {
  if (!JWT_SECRET) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is not set in production. ' +
      'Set a 64+ char random string in Vercel env vars before deploying.'
    );
  }
  if (JWT_SECRET.length < 32) {
    throw new Error(
      `FATAL: JWT_SECRET is too short (${JWT_SECRET.length} chars). ` +
      'Use at least 32 characters (64+ recommended).'
    );
  }
  if (JWT_SECRET === DEV_SECRET) {
    throw new Error(
      'FATAL: JWT_SECRET is the dev fallback — this is publicly known. ' +
      'Generate a new random secret for production.'
    );
  }
}

// En dev/build : utiliser le secret fourni, ou un dev secret (avec warning)
const SECRET: string = JWT_SECRET || (isBuildTime ? DEV_SECRET : '');

if (isBuildTime && !JWT_SECRET) {
  console.warn(
    '⚠️ [auth.ts] JWT_SECRET non défini — utilisation du secret dev. ' +
    'OK en dev, FATAL en production (runtime crash au premier import).'
  );
}

const JWT_SIGN_SECRET: string = SECRET || DEV_SECRET;
const REFRESH_SIGN_SECRET: string = JWT_SIGN_SECRET + '-refresh';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Access token — short-lived (15 minutes)
export function generateToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SIGN_SECRET, { expiresIn: '15m' });
}

// Refresh token — long-lived (7 days)
export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign({ userId: payload.userId, type: 'refresh' }, REFRESH_SIGN_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SIGN_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SIGN_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'refresh') return null;
    return decoded;
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

// Cookie helper — set both access and refresh cookies
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  
  response.cookies.set('wakhma_access', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });
  
  response.cookies.set('wakhma_refresh', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('wakhma_access', '', { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set('wakhma_refresh', '', { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 0 });
}
