import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { MAX_REFERRAL_POINTS, POINTS_PER_REFERRAL } from '@/lib/constants';

// GET: Get referral stats and history
export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Non autorisé. Connectez-vous d\'abord.' },
        { status: 401 }
      ));
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        points: true,
        referralCode: true,
      },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    // Get referral history
    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: { name: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalReferralPoints = referrals.reduce((sum, r) => sum + r.points, 0);
    const remainingPoints = Math.max(0, MAX_REFERRAL_POINTS - totalReferralPoints);
    const canEarnMore = totalReferralPoints < MAX_REFERRAL_POINTS;
    const maxReferrals = Math.floor(MAX_REFERRAL_POINTS / POINTS_PER_REFERRAL);
    const currentReferralCount = referrals.length;

    return securityHeaders(NextResponse.json({
      referralCode: user.referralCode,
      points: user.points,
      totalReferralPoints,
      remainingPoints,
      canEarnMore,
      currentReferralCount,
      maxReferrals,
      pointsPerReferral: POINTS_PER_REFERRAL,
      maxReferralPoints: MAX_REFERRAL_POINTS,
      referrals: referrals.map((r) => ({
        id: r.id,
        points: r.points,
        createdAt: r.createdAt,
        referredName: r.referred.name || r.referred.email.split('@')[0],
      })),
    }));
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement des stats de parrainage' },
      { status: 500 }
    ));
  }
}
