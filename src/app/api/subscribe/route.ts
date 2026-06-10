import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';
import { PLANS, type PlanId } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(ip);
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      ));
    }

    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const plan = body.plan as PlanId;
    const paymentMethod = body.paymentMethod as string;

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

    // Validate payment method
    const validMethods = ['wave', 'orange_money'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return securityHeaders(NextResponse.json(
        { error: 'Méthode de paiement invalide' },
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

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create a PENDING subscription — admin must verify payment before activation
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan: plan,
        priceFcfa: planData.price,
        status: 'pending',
        startDate,
        endDate,
      },
    });

    // Do NOT auto-activate plan or credit points — wait for admin approval
    return securityHeaders(NextResponse.json({
      success: true,
      message: `Demande d'abonnement ${planData.name} envoyée ! Envoyez ${planData.price.toLocaleString('fr-FR')} FCFA via ${paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} au ${process.env.PAYMENT_PHONE || '78 927 12 96'}, puis envoyez la capture sur WhatsApp pour validation.`,
      subscription: {
        id: subscription.id,
        plan: planData.name,
        priceFcfa: planData.price,
        status: 'pending',
        startDate,
        endDate,
      },
    }));
  } catch (error) {
    console.error('Error subscribing:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    ));
  }
}
