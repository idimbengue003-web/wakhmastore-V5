import { NextRequest, NextResponse } from 'next/server';
import { securityHeaders } from '@/lib/security-headers';

/**
 * POST /api/auth/oauth-exchange
 *
 * Reads OAuth token and user data from httpOnly cookies set by OAuth callbacks,
 * returns them to the client, and clears the cookies.
 * Auth cookies (wakhma_access, wakhma_refresh) are already set by the OAuth callback redirect.
 * This prevents tokens from being exposed in URL parameters.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('wakhma_oauth_token')?.value;
  const userStr = request.cookies.get('wakhma_oauth_user')?.value;

  if (!token || !userStr) {
    return securityHeaders(NextResponse.json(
      { error: 'No OAuth data found. Please try logging in again.' },
      { status: 400 }
    ));
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    return securityHeaders(NextResponse.json(
      { error: 'Invalid OAuth data' },
      { status: 400 }
    ));
  }

  // Return the user data so the client can update its state
  // Auth cookies (wakhma_access, wakhma_refresh) were already set by the callback redirect
  const response = securityHeaders(NextResponse.json({ token, user }));
  
  // Clear the OAuth cookies (one-time use)
  response.cookies.set('wakhma_oauth_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('wakhma_oauth_user', '', { maxAge: 0, path: '/' });

  return response;
}
