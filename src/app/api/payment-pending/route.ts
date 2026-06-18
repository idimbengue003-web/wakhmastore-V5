// ============================================================================
// WAKHMA STORE — /api/payment-pending
// ============================================================================
// Endpoint appelé par le frontend AVANT de rediriger l'utilisateur vers Wave.
// Crée un enregistrement "pending" en DB qui sera matché plus tard par
// /api/payment-status quand le paiement Wave sera détecté via Wave Business.
//
// Flux :
// 1. Client clique "Payer X FCFA" sur /recharge ou /abonnements ou /acheter-points
// 2. Frontend appelle CE endpoint avec { planId, amount, type }
// 3. On crée un PointPurchase { status: 'pending', expiresAt: now+30min }
// 4. Frontend redirige vers /paiement/confirmation?pending=<id>&montant=...
// 5. La page /paiement/confirmation affiche le bouton "Payer avec Wave"
//    (URL Wave Business checkout avec montant pré-rempli + client_reference=<pendingId>)
// 6. Client paie sur Wave (paiement marchand non annulable)
// 7. /api/payment-status interroge Wave Business GraphQL → match par montant
//    + client_reference → crédite les points/active l'abonnement
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLANS, POINT_PACKAGES } from '@/lib/constants';
import { getUserFromRequest } from '@/lib/get-user';

// Durée de validité d'un pending (30 minutes)
const PENDING_TTL_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, amount, type, userPhone } = body;

    // ── Auth : récupérer l'utilisateur depuis le cookie httpOnly wakhma_access
    // (mécanique standard du projet — utilisée par /api/subscriptions, etc.)
    const session = getUserFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // ── Validation des données ─────────────────────────────────────────────
    if (!planId || !amount || !type) {
      return NextResponse.json(
        { success: false, error: 'Champs requis: planId, amount, type' },
        { status: 400 }
      );
    }

    if (type !== 'abonnement' && type !== 'points') {
      return NextResponse.json(
        { success: false, error: 'type doit être "abonnement" ou "points"' },
        { status: 400 }
      );
    }

    // Vérifier que le planId existe dans la config
    if (type === 'abonnement') {
      if (!PLANS[planId as keyof typeof PLANS]) {
        return NextResponse.json(
          { success: false, error: `Plan inconnu: ${planId}` },
          { status: 400 }
        );
      }
    } else {
      if (!POINT_PACKAGES.find(p => p.id === planId)) {
        return NextResponse.json(
          { success: false, error: `Pack de points inconnu: ${planId}` },
          { status: 400 }
        );
      }
    }

    // Vérifier que le montant correspond au plan
    const expectedAmount = type === 'abonnement'
      ? PLANS[planId as keyof typeof PLANS].price
      : POINT_PACKAGES.find(p => p.id === planId)!.price;

    if (Number(amount) !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: `Montant incorrect. Attendu: ${expectedAmount}, reçu: ${amount}` },
        { status: 400 }
      );
    }

    // ── Calcul de l'expiration ─────────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PENDING_TTL_MINUTES);

    // ── Créer le pending payment ───────────────────────────────────────────
    const pending = await db.pointPurchase.create({
      data: {
        userId: user.id,
        amountFcfa: Number(amount),
        pointsAdded: 0, // sera rempli à la confirmation
        status: 'pending',
        paymentMethod: 'wave_auto',
        planId,
        purchaseType: type,
        expiresAt,
      },
    });

    console.log(
      `[PAYMENT-PENDING] Créé: id=${pending.id} | user=${user.phone || user.email} | ` +
      `plan=${planId} | montant=${amount} FCFA | type=${type} | ` +
      `client_reference=${pending.id} | expire=${expiresAt.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      pendingId: pending.id,
      expiresAt: expiresAt.toISOString(),
      userPhone: user.phone || userPhone,
    });

  } catch (error) {
    console.error('[PAYMENT-PENDING] Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Utilisez POST' }, { status: 405 });
}
