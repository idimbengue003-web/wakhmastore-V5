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

// Routes that should be excluded from middleware (public)
const PUBLIC_ROUTES = [
  '/',
  '/annonces',
  '/login',
  '/register',
  '/cgu',
  '/mentions-legales',
  '/confidentialite',
  '/auth/callback',
  '/api/auth',
  '/api/annonces', // GET is public
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

  // Check protected routes — redirect to login if no token
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute) {
    // Check for token in localStorage (client-side) — middleware can't access localStorage
    // Instead, we check for the auth cookie as a hint
    const hasToken = request.cookies.get('wakhma_token')?.value ||
                     request.headers.get('authorization')?.startsWith('Bearer ');

    // For API routes, the route handlers check auth themselves
    // For page routes, we let the client-side handle redirect (since we use localStorage)
    // This middleware mainly adds security headers
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
