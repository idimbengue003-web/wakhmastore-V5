import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';
import { securityHeaders } from '@/lib/security-headers';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  clearAuthCookies(response);
  return securityHeaders(response);
}
