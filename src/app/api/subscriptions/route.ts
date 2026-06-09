import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'diambar',
    name: 'Diambar',
    priceFcfa: 2000,
    period: '/mois',
    unlockCost: 1000, // Cost per annonce unlock
    features: [
      'Débloque une annonce à 1 000 points au lieu de 1 500',
      '15 annonces par mois',
      'Badge Diambar',
      'Annonces mises en avant',
      'Support prioritaire WhatsApp',
    ],
  },
  {
    id: 'vip_king',
    name: 'VIP KING',
    priceFcfa: 5000,
    period: '/mois',
    unlockCost: 800, // Cost per annonce unlock
    features: [
      'Débloque une annonce à 800 points au lieu de 1 500',
      'Annonces illimitées',
      'Badge VIP KING',
      'Annonces en tête de liste',
      'Support prioritaire WhatsApp',
      'Statistiques détaillées',
      'Mise en avant hebdomadaire',
    ],
  },
] as const;

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

    const validMethods = ['wave', 'orange_money', 'bank_transfer'];
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

    // Create subscription record
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan: plan.id,
        priceFcfa: plan.priceFcfa,
        status: 'active', // Auto-activate for demo
        startDate,
        endDate,
      },
    });

    // Update user plan
    await db.user.update({
      where: { id: user.id },
      data: { plan: plan.id },
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: `Abonnement ${plan.name} activé avec succès !`,
      subscription: {
        id: subscription.id,
        plan: plan.name,
        priceFcfa: plan.priceFcfa,
        unlockCost: plan.unlockCost,
        startDate,
        endDate,
        status: 'active',
      },
      newPlan: plan.id,
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

  let currentSubscription = null;
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
