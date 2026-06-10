import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

/**
 * Shared logic: Check for expired subscriptions and downgrade users.
 */
async function checkExpiredSubscriptions() {
  const now = new Date();

  // Find all active subscriptions that have expired
  const expiredSubs = await db.subscription.findMany({
    where: {
      status: 'active',
      endDate: { lte: now },
    },
  });

  let downgradedCount = 0;

  for (const sub of expiredSubs) {
    await db.$transaction(async (tx) => {
      // Mark subscription as expired
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: 'expired' },
      });

      // Downgrade user plan to 'none'
      await tx.user.update({
        where: { id: sub.userId },
        data: { plan: 'none' },
      });

      // Remove VIP status from their annonces
      await tx.annonce.updateMany({
        where: { authorId: sub.userId },
        data: { isVip: false, vipType: null },
      });
    });

    downgradedCount++;
  }

  return {
    checkedAt: now.toISOString(),
    expiredCount: expiredSubs.length,
    downgradedCount,
  };
}

/**
 * POST /api/admin/check-expired
 * Admin-only (or cron): Check for expired subscriptions and downgrade users.
 */
export async function POST(request: NextRequest) {
  try {
    // Allow admin or cron secret
    const payload = getUserFromRequest(request);
    const cronSecret = request.headers.get('x-cron-secret');
    const isCron = cronSecret === process.env.CRON_SECRET;

    if (!isCron && (!payload || payload.role !== 'admin')) {
      return securityHeaders(NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      ));
    }

    const result = await checkExpiredSubscriptions();

    return securityHeaders(NextResponse.json({
      success: true,
      ...result,
    }));
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    ));
  }
}

/**
 * GET /api/admin/check-expired
 * Vercel Cron endpoint: sends a GET request with x-cron-secret header.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron sends a CRON_SECRET header
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return securityHeaders(NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      ));
    }

    const result = await checkExpiredSubscriptions();

    return securityHeaders(NextResponse.json({
      success: true,
      ...result,
    }));
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    ));
  }
}
