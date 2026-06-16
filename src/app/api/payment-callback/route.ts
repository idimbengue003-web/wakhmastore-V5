// ============================================================================
// WAKHMA STORE — /api/payment-callback
// ============================================================================
// Endpoint appelé par le payment gateway quand un paiement est confirmé.
// C'est ici que les points/abonnements sont crédités automatiquement au client.
//
// Flux :
// 1. Client paie sur checkout.html (payment-gateway)
// 2. MacroDroid capte le SMS Wave → envoie au gateway
// 3. Gateway confirme → appelle CE endpoint
// 4. On crédite les points/abonnement au client dans PostgreSQL
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

// Clé secrète partagée avec le payment gateway
const GATEWAY_SECRET = process.env.PAYMENT_GATEWAY_SECRET || 'votre_cle_secrete_ultra_longue_ici';

// Plans du payment gateway (doit correspondre au gateway)
const GATEWAY_PLANS: Record<string, {
  categorie: 'abonnement' | 'points';
  points?: number;
  duree?: number;
  planDbId?: string; // ID du plan dans la DB locale (gratuit, diambar, vip_king)
}> = {
  'bolt': { categorie: 'abonnement', duree: 30, planDbId: 'gratuit' },
  'diambar': { categorie: 'abonnement', duree: 30, planDbId: 'diambar' },
  'vip-king': { categorie: 'abonnement', duree: 30, planDbId: 'vip_king' },
  'points-7000': { categorie: 'points', points: 7000 },
  'points-17000': { categorie: 'points', points: 17000 },
  'points-50000': { categorie: 'points', points: 50000 },
  'points-105000': { categorie: 'points', points: 105000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-webhook-signature');

    console.log('[PAYMENT-CALLBACK] Reçu:', JSON.stringify(body).substring(0, 300));

    // ── ÉTAPE 1: Vérifier la signature HMAC ─────────────────────────────────
    if (!signature) {
      console.error('[PAYMENT-CALLBACK] Pas de signature');
      return NextResponse.json({ success: false, error: 'Signature manquante' }, { status: 401 });
    }

    const expectedSig = crypto
      .createHmac('sha256', GATEWAY_SECRET)
      .update(`${body.transaction_id}:${body.montant}:${body.client_phone}`)
      .digest('hex');

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSig, 'hex')
      );
      if (!isValid) {
        console.error('[PAYMENT-CALLBACK] Signature invalide');
        return NextResponse.json({ success: false, error: 'Signature invalide' }, { status: 401 });
      }
    } catch {
      console.error('[PAYMENT-CALLBACK] Erreur vérification signature');
      return NextResponse.json({ success: false, error: 'Signature invalide' }, { status: 401 });
    }

    // ── ÉTAPE 2: Vérifier les données requises ──────────────────────────────
    const { transaction_id, montant, client_phone, plan_id, plan_nom, plan_categorie, points, duree, confirmed_at } = body;

    if (!transaction_id || !montant || !client_phone) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: transaction_id, montant, client_phone' },
        { status: 400 }
      );
    }

    // ── ÉTAPE 3: Vérifier que la transaction n'a pas déjà été traitée ──────
    const existingPurchase = await db.pointPurchase.findFirst({
      where: { id: transaction_id, status: 'completed' },
    });

    if (existingPurchase) {
      console.log(`[PAYMENT-CALLBACK] Transaction ${transaction_id} déjà traitée — skip`);
      return NextResponse.json({
        success: true,
        message: 'Transaction déjà traitée',
        points_credited: existingPurchase.pointsAdded,
      });
    }

    // ── ÉTAPE 4: Trouver l'utilisateur par numéro de téléphone ─────────────
    const cleanPhone = client_phone.replace(/\s/g, '').replace(/\+/g, '');

    let user = await db.user.findFirst({
      where: { phone: cleanPhone },
    });

    // Si pas trouvé par téléphone exact, essayer un format plus large
    if (!user) {
      user = await db.user.findFirst({
        where: {
          phone: { contains: cleanPhone.slice(-8) },
        },
      });
    }

    if (!user) {
      console.warn(`[PAYMENT-CALLBACK] Aucun utilisateur trouvé pour le téléphone ${cleanPhone}`);
      return NextResponse.json(
        { success: false, error: `Aucun utilisateur trouvé pour le téléphone ${cleanPhone}. L'utilisateur doit d'abord créer un compte sur wakhmastore.com.` },
        { status: 404 }
      );
    }

    // ── ÉTAPE 5: Traiter le paiement selon le type de plan ─────────────────
    const gatewayPlan = plan_id ? GATEWAY_PLANS[plan_id] : null;
    const effectiveCategory = plan_categorie || gatewayPlan?.categorie;
    let pointsAdded = 0;

    if (effectiveCategory === 'points' || points) {
      // ═══════════════════════════════════════════════════════════════════════
      // ACHAT DE POINTS
      // ═══════════════════════════════════════════════════════════════════════
      pointsAdded = points || gatewayPlan?.points || 0;

      if (pointsAdded > 0) {
        // Créditer les points à l'utilisateur
        await db.user.update({
          where: { id: user.id },
          data: { points: { increment: pointsAdded } },
        });

        // Créer l'enregistrement PointPurchase
        await db.pointPurchase.upsert({
          where: { id: transaction_id },
          create: {
            id: transaction_id,
            userId: user.id,
            amountFcfa: montant,
            pointsAdded,
            status: 'completed',
            paymentMethod: 'wave_auto',
          },
          update: {
            status: 'completed',
            pointsAdded,
          },
        });

        console.log(`[PAYMENT-CALLBACK] +${pointsAdded} points crédités à ${user.phone} (nouveau solde: ${user.points + pointsAdded})`);
      }

    } else if (effectiveCategory === 'abonnement' || duree) {
      // ═══════════════════════════════════════════════════════════════════════
      // ACTIVATION D'ABONNEMENT
      // ═══════════════════════════════════════════════════════════════════════
      const subDays = duree || gatewayPlan?.duree || 30;
      const planDbId = gatewayPlan?.planDbId || plan_id || 'gratuit';

      // Calculer la date de fin
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + subDays);

      // Activer le plan de l'utilisateur
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: planDbId,
        },
      });

      // Créer l'enregistrement Subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: planDbId,
          priceFcfa: montant,
          status: 'active',
          startDate: now,
          endDate,
        },
      });

      // Créditer aussi les points du plan (BOLT=15000, DIAMBAR=26000, VIP KING=49000)
      const { PLANS } = await import('@/lib/constants');
      const planConfig = PLANS[planDbId as keyof typeof PLANS];
      if (planConfig && planConfig.points > 0) {
        pointsAdded = planConfig.points;
        await db.user.update({
          where: { id: user.id },
          data: { points: { increment: pointsAdded } },
        });
      }

      console.log(`[PAYMENT-CALLBACK] Abonnement ${planDbId} activé pour ${user.phone} jusqu'au ${endDate.toISOString()} + ${pointsAdded} points`);

    } else {
      // ═══════════════════════════════════════════════════════════════════════
      // PAIEMENT LIBRE (pas de plan)
      // ═══════════════════════════════════════════════════════════════════════
      console.log(`[PAYMENT-CALLBACK] Paiement libre de ${montant} XOF de ${user.phone}`);
    }

    // ── ÉTAPE 6: Réponse de succès ─────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'Paiement traité avec succès',
      transaction_id,
      user_id: user.id,
      phone: user.phone || cleanPhone,
      points_credited: pointsAdded,
      new_balance: user.points + pointsAdded,
      plan: user.plan,
    });

  } catch (error) {
    console.error('[PAYMENT-CALLBACK] Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Rejeter GET
export async function GET() {
  return NextResponse.json({ error: 'Utilisez POST' }, { status: 405 });
}
