import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { PLANS } from '@/lib/constants';

/**
 * POST /api/admin/approve-subscription
 * Admin-only: Approve a pending subscription, activate the plan and credit points.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'admin') {
      return securityHeaders(NextResponse.json(
        { error: 'Accès refusé. Réservé aux administrateurs.' },
        { status: 403 }
      ));
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return securityHeaders(NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      ));
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return securityHeaders(NextResponse.json(
        { error: 'Abonnement non trouvé' },
        { status: 404 }
      ));
    }

    if (subscription.status !== 'pending') {
      return securityHeaders(NextResponse.json(
        { error: `Abonnement déjà ${subscription.status}` },
        { status: 400 }
      ));
    }

    const planData = PLANS[subscription.plan as keyof typeof PLANS];
    if (!planData || planData.id === 'none') {
      return securityHeaders(NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      ));
    }

    // Activate subscription and credit points in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update subscription status
      const updatedSub = await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'active' },
      });

      // Update user plan and credit points
      const updatedUser = await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: subscription.plan,
          points: { increment: planData.points },
        },
      });

      // Mark annonces as VIP based on plan
      if (subscription.plan === 'diambar' || subscription.plan === 'gratuit') {
        await tx.annonce.updateMany({
          where: { authorId: subscription.userId, isVip: false },
          data: { isVip: true, vipType: 'diambar' },
        });
      } else if (subscription.plan === 'vip_king') {
        await tx.annonce.updateMany({
          where: { authorId: subscription.userId },
          data: { isVip: true, vipType: 'vip_king' },
        });
      }

      return { subscription: updatedSub, user: updatedUser };
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: `Abonnement ${planData.name} activé pour l'utilisateur. ${planData.points.toLocaleString('fr-FR')} points crédités.`,
      subscription: result.subscription,
      newPlan: subscription.plan,
      newPoints: result.user.points,
    }));
  } catch (error) {
    console.error('Error approving subscription:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'approbation' },
      { status: 500 }
    ));
  }
}
