import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'gratuit',
    name: 'BOLT ⚡',
    priceFcfa: 2000,
    period: '/mois',
    unlockCost: 1500, // Cost per annonce unlock
    pointsIncluded: 15000,
    annoncesVends: 3,
    features: [
      '15 000 points offerts',
      '3 annonces « Je vends » par mois',
      'Débloque une annonce à 1 500 points',
      'Badge ⚡ DIAMBAR',
      'Visibilité standard',
      'Support par email',
    ],
  },
  {
    id: 'diambar',
    name: 'DIAMBAR',
    priceFcfa: 5000,
    period: '/mois',
    unlockCost: 1000, // Cost per annonce unlock
    pointsIncluded: 26000,
    annoncesVends: 5,
    features: [
      '26 000 points inclus',
      '5 annonces « Je vends » par mois',
      'Débloque une annonce à 1 000 points au lieu de 1 500',
      'Badge ⭐ DIAMBAR',
      'Annonces mises en avant',
      'Support prioritaire WhatsApp',
    ],
  },
  {
    id: 'vip_king',
    name: 'VIP KING',
    priceFcfa: 9900,
    period: '/mois',
    unlockCost: 800, // Cost per annonce unlock
    pointsIncluded: 49000,
    annoncesVends: 5, // 5 per week
    features: [
      '49 000 points inclus',
      '5 annonces « Je vends » par semaine',
      'Débloque une annonce à 800 points au lieu de 1 500',
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

    // Get current user points
    const currentUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { points: true },
    });
    const currentPoints = currentUser?.points ?? 0;
    const newPointsBalance = currentPoints + (plan as { pointsIncluded?: number }).pointsIncluded!;

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

    // Update user plan and credit included points
    await db.user.update({
      where: { id: user.id },
      data: {
        plan: plan.id,
        points: newPointsBalance,
      },
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: `Abonnement ${plan.name} activé avec succès ! ${(plan as { pointsIncluded?: number }).pointsIncluded?.toLocaleString('fr-FR')} points crédités.`,
      subscription: {
        id: subscription.id,
        plan: plan.name,
        priceFcfa: plan.priceFcfa,
        unlockCost: plan.unlockCost,
        pointsIncluded: (plan as { pointsIncluded?: number }).pointsIncluded,
        startDate,
        endDate,
        status: 'active',
      },
      newPlan: plan.id,
      newPointsBalance,
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
