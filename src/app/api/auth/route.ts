import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, generateRefreshToken, hashPassword, setAuthCookies } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for auth
    const ip = getClientIp(request);
    const { allowed, remaining } = await rateLimit(ip, 'auth');
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
        { status: 429 }
      ));
    }

    const body = await request.json();

    // Input validation
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((e: { message: string }) => e.message).join(', ');
      return securityHeaders(NextResponse.json(
        { error: errors },
        { status: 400 }
      ));
    }

    const { email, password } = result.data;

    // Find user using Prisma
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, phone: true, password: true, role: true, plan: true, points: true, referralCode: true },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Email ou code PIN incorrect' },
        { status: 401 }
      ));
    }

    // Verify password with bcrypt
    let isValid = false;
    try {
      isValid = await verifyPassword(password, user.password);
    } catch {
      // If bcrypt fails (corrupted hash), deny login — do NOT fall back to plain text
      isValid = false;
    }

    if (!isValid) {
      return securityHeaders(NextResponse.json(
        { error: `Email ou code PIN incorrect. ${remaining} tentatives restantes.` },
        { status: 401 }
      ));
    }

    // Generate JWT tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const response = NextResponse.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        points: user.points,
        referralCode: user.referralCode,
      },
    });
    setAuthCookies(response, accessToken, refreshToken);
    return securityHeaders(response);
  } catch (error) {
    console.error('Error during login:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    ));
  }
}
