import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { PLANS, type PlanId } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const plan = body.plan as PlanId;

    if (!plan || !PLANS[plan]) {
      return securityHeaders(NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      ));
    }

    if (plan === 'none') {
      return securityHeaders(NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      ));
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      ));
    }

    if (user.plan === plan) {
      return securityHeaders(NextResponse.json(
        { error: 'Vous avez déjà ce plan' },
        { status: 400 }
      ));
    }

    const planData = PLANS[plan];

    // Update user plan and add points in a transaction
    const updatedUser = await db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: payload.userId },
        data: {
          plan: plan,
          points: { increment: planData.points },
        },
      });

      // Mark existing annonces as VIP based on plan
      if (plan === 'diambar') {
        await tx.annonce.updateMany({
          where: { authorId: payload.userId, isVip: false },
          data: { isVip: true, vipType: 'diambar' },
        });
      } else if (plan === 'vip_king') {
        await tx.annonce.updateMany({
          where: { authorId: payload.userId },
          data: { isVip: true, vipType: 'vip_king' },
        });
      } else if (plan === 'gratuit') {
        // BOLT plan: mark annonces as VIP with diambar type
        await tx.annonce.updateMany({
          where: { authorId: payload.userId, isVip: false },
          data: { isVip: true, vipType: 'diambar' },
        });
      }

      return updatedUser;
    });

    return securityHeaders(NextResponse.json({
      success: true,
      plan: plan,
      points: updatedUser.points,
      message: `Plan ${planData.name} activé ! ${planData.points.toLocaleString('fr-FR')} points ajoutés.`,
    }));
  } catch (error) {
    console.error('Error subscribing:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'activation du plan' },
      { status: 500 }
    ));
  }
}
