import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

/**
 * POST /api/admin/check-expired
 * Admin-only (or cron): Check for expired subscriptions and downgrade users.
 * This should be called periodically (e.g., daily via a cron job).
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

    return securityHeaders(NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      expiredSubscriptions: expiredSubs.length,
      downgradedUsers: downgradedCount,
    }));
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    ));
  }
}
