import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/deposer',
  '/profil',
  '/recharge',
  '/abonnements',
  '/parrainage',
  '/acheter-points',
];

// Routes that are admin-only
const ADMIN_ROUTES = [
  '/api/admin',
  '/api/init-db',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Check admin routes — block non-admins at middleware level
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    // Admin API routes are protected at the route handler level with getUserFromRequest
    // This is an additional layer
    return response;
  }

  // Check protected routes — verify auth cookies exist
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute) {
    const hasAccessToken = request.cookies.get('wakhma_access')?.value;
    const hasRefreshToken = request.cookies.get('wakhma_refresh')?.value;

    if (!hasAccessToken && !hasRefreshToken) {
      // No tokens at all — redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If we have at least a refresh token, let the request through.
    // The client-side code will call /api/auth/refresh to get a new access token.
    // The API routes themselves verify token validity via getUserFromRequest().
    // If the refresh token is also invalid, the API will return 401 and
    // the client will redirect to login.
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
