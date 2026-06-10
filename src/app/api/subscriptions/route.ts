import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';
import { PLANS } from '@/lib/constants';

// Subscription plans from centralized constants
export const SUBSCRIPTION_PLANS = Object.values(PLANS).filter(p => p.id !== 'none').map(plan => ({
  id: plan.id,
  name: plan.name,
  priceFcfa: plan.price,
  period: plan.period,
  unlockCost: plan.id === 'vip_king' ? 800 : plan.id === 'diambar' ? 1000 : 1500,
  pointsIncluded: plan.points,
  annoncesVends: plan.annoncesPerWeek > 0 ? plan.annoncesPerWeek : plan.annoncesPerMonth,
  features: [...plan.features],
}));

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      ));
    }

    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise. Connectez-vous d\'abord.' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const { planId, paymentMethod } = body;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return securityHeaders(NextResponse.json(
        { error: 'Plan d\'abonnement invalide' },
        { status: 400 }
      ));
    }

    const validMethods = ['wave', 'orange_money'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return securityHeaders(NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      ));
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, plan: true, name: true },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    // Calculate subscription end date (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create subscription record with PENDING status — admin must verify payment
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan: plan.id,
        priceFcfa: plan.priceFcfa,
        status: 'pending', // Wait for admin to confirm payment before activating
        startDate,
        endDate,
      },
    });

    // Do NOT auto-credit points or change plan — wait for admin approval
    // The admin will approve via a separate endpoint

    return securityHeaders(NextResponse.json({
      success: true,
      message: `Demande d'abonnement ${plan.name} envoyée ! Envoyez ${plan.priceFcfa.toLocaleString('fr-FR')} FCFA via Wave ou Orange Money au ${process.env.PAYMENT_PHONE || '78 927 12 96'}, puis envoyez la capture sur WhatsApp pour validation.`,
      subscription: {
        id: subscription.id,
        plan: plan.name,
        priceFcfa: plan.priceFcfa,
        status: 'pending',
        startDate,
        endDate,
      },
    }));
  } catch (error) {
    console.error('Error creating subscription:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    ));
  }
}

// GET: Return available subscription plans and current subscription
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentSubscription: any = null;
  if (payload) {
    const sub = await db.subscription.findFirst({
      where: { userId: payload.userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (sub) {
      currentSubscription = sub;
    }
  }

  return securityHeaders(NextResponse.json({
    plans: SUBSCRIPTION_PLANS,
    currentSubscription,
  }));
}
