import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function getUserFromRequest(request: NextRequest): { userId: string; email: string; role: string } | null {
  // First try cookie (new httpOnly cookie auth)
  const cookieToken = request.cookies.get('wakhma_access')?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload) return payload;
  }
  
  // Fallback to Authorization header (for backward compatibility during migration)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }
  
  return null;
}
