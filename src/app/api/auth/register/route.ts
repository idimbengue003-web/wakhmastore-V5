import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

const MAX_REFERRAL_POINTS = 30000;
const POINTS_PER_REFERRAL = 400;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const { allowed } = rateLimit(ip, 'auth');
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      ));
    }

    const body = await request.json();

    // Input validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return securityHeaders(NextResponse.json(
        { error: errors },
        { status: 400 }
      ));
    }

    const { name, email, phone, password, referralCode } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return securityHeaders(NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      ));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique referral code
    let userReferralCode = generateReferralCode();
    let codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
    while (codeExists) {
      userReferralCode = generateReferralCode();
      codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
    }

    // Handle referral
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (!referrer) {
        return securityHeaders(NextResponse.json(
          { error: 'Code de parrainage invalide' },
          { status: 400 }
        ));
      }
      referredBy = referrer.id;
    }

    // Create user with phone (mandatory)
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone.replace(/\s/g, ''),
        password: hashedPassword,
        referralCode: userReferralCode,
        referredBy: referredBy,
      },
    });

    // If referred, create referral record and add points
    if (referredBy) {
      const referrer = await db.user.findUnique({ where: { id: referredBy } });
      if (referrer) {
        // Check if referrer hasn't hit the cap
        const currentReferralPoints = await db.referral.aggregate({
          where: { referrerId: referredBy },
          _sum: { points: true },
        });

        const totalPoints = currentReferralPoints._sum.points || 0;

        if (totalPoints < MAX_REFERRAL_POINTS) {
          const pointsToAdd = Math.min(POINTS_PER_REFERRAL, MAX_REFERRAL_POINTS - totalPoints);

          await db.referral.create({
            data: {
              referrerId: referredBy,
              referredId: user.id,
              points: pointsToAdd,
            },
          });

          await db.user.update({
            where: { id: referredBy },
            data: { points: referrer.points + pointsToAdd },
          });
        }
      }
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        points: user.points,
        referralCode: user.referralCode,
        avatar: user.avatar,
        provider: user.provider,
      },
    }, { status: 201 }));
  } catch (error) {
    console.error('Error during registration:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
    return securityHeaders(NextResponse.json(
      { error: message },
      { status: 500 }
    ));
  }
}
