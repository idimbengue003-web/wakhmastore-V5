import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, generateRefreshToken, generateReferralCode, setAuthCookies } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { MAX_REFERRAL_POINTS, POINTS_PER_REFERRAL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(ip, 'auth');
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
      const errors = result.error.issues.map((e: { message: string }) => e.message).join(', ');
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

    // Normalize phone number
    const normalizedPhone = phone!.startsWith('+221') ? phone
      : phone!.startsWith('0') ? '+221' + phone!.slice(1)
      : '+221' + phone;

    // Check if phone is already used
    const existingPhone = await db.user.findFirst({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      return securityHeaders(NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé par un autre compte' },
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

    // Create user with referral in a transaction
    const user = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: normalizedPhone,
          password: hashedPassword,
          referralCode: userReferralCode,
          referredBy: referredBy,
        },
      });

      // If referred, create referral record and add points
      if (referredBy) {
        const referrer = await tx.user.findUnique({ where: { id: referredBy } });
        if (referrer) {
          // Check if referrer hasn't hit the cap
          const currentReferralPoints = await tx.referral.aggregate({
            where: { referrerId: referredBy },
            _sum: { points: true },
          });

          const totalPoints = currentReferralPoints._sum.points || 0;

          if (totalPoints < MAX_REFERRAL_POINTS) {
            const pointsToAdd = Math.min(POINTS_PER_REFERRAL, MAX_REFERRAL_POINTS - totalPoints);

            await tx.referral.create({
              data: {
                referrerId: referredBy,
                referredId: user.id,
                points: pointsToAdd,
              },
            });

            await tx.user.update({
              where: { id: referredBy },
              data: { points: referrer.points + pointsToAdd },
            });
          }
        }
      }

      return user;
    });

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
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        points: user.points,
        referralCode: user.referralCode,
      },
    }, { status: 201 });
    setAuthCookies(response, accessToken, refreshToken);
    return securityHeaders(response);
  } catch (error) {
    console.error('Error during registration:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    ));
  }
}
