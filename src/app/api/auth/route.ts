import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for auth
    const ip = getClientIp(request);
    const { allowed, remaining } = rateLimit(ip, 'auth');
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
      const errors = (result.error.issues || result.error.errors || []).map((e: { message: string }) => e.message).join(', ');
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
      // Fallback for legacy plain-text passwords (migration support)
      isValid = user.password === password;
      if (isValid) {
        // Auto-upgrade to hashed password
        const hashed = await hashPassword(password);
        await db.user.update({
          where: { id: user.id },
          data: { password: hashed },
        });
      }
    }

    if (!isValid) {
      return securityHeaders(NextResponse.json(
        { error: `Email ou code PIN incorrect. ${remaining} tentatives restantes.` },
        { status: 401 }
      ));
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return securityHeaders(NextResponse.json({
      token,
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
    }));
  } catch (error) {
    console.error('Error during login:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    ));
  }
}
