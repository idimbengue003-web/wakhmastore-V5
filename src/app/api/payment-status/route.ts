// ============================================================================
// WAKHMA STORE — /api/payment-status
// ============================================================================
// Endpoint de polling intelligent appelé par la page /paiement/confirmation.
//
// 🎯 PRINCIPE :
// - L'utilisateur paie sur Wave → page de confirmation poll cet endpoint
// - À chaque appel, on vérifie le statut du pending en DB
// - Si le dernier check Wave Business date de > 30s, on lance un check
// - Si une transaction Wave correspond → on crédite les points atomiquement
// - On retourne le statut au frontend
//
// 📊 CHARGE :
// - 1 appel user / 3s pendant 3-5 min en moyenne
// - 1 appel Wave Business / 30s max (debounce global côté wave-business.ts)
// - 0 appel Wave Business si aucun user n'est en train d'attendre
//
// 🔐 SÉCURITÉ :
// - Authentification par cookie de session (l'utilisateur doit être connecté)
// - Vérification que le pending appartient bien à l'utilisateur connecté
// - Anti-doublon via externalRef @unique en DB
//
// 📥 PARAMÈTRES :
//   GET /api/payment-status?id=<purchaseId>
//
// 📤 RÉPONSES :
//   { status: 'pending' }                          → toujours en attente
//   { status: 'confirmed', points: 2000 }          → paiement confirmé, points crédités
//   { status: 'expired' }                          → délai dépassé (10 min)
//   { status: 'not_found' }                        → pending inconnu
//   { status: 'forbidden' }                        → pending ne appartient pas à l'user
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLANS, POINT_PACKAGES } from '@/lib/constants';
import {
  findMatchingTransaction,
  isWaveBusinessConfigured,
  WaveSessionExpiredError,
} from '@/lib/wave-business';

// Durée max d'un pending avant expiration (en minutes)
const PENDING_TTL_MINUTES = 10;

// ─────────────────────────────────────────────────────────────────────────────
// UTIL : récupère l'user connecté depuis le cookie de session
// ─────────────────────────────────────────────────────────────────────────────
async function getCurrentUser(req: NextRequest): Promise<{ id: string; phone: string } | null> {
  try {
    const { getUserFromRequest } = await import('@/lib/get-user');
    const session = getUserFromRequest(req);
    if (!session) return null;

    // getUserFromRequest retourne { userId, email, role } — il faut charger le user
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, phone: true },
    });
    if (!user) return null;
    return { id: user.id, phone: user.phone || '' };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRÉDIT ATOMIQUE (transaction SQL)
// ─────────────────────────────────────────────────────────────────────────────
async function creditPurchase(purchaseId: string, externalRef: string, senderPhone: string) {
  return db.$transaction(async (tx) => {
    // 1. Recharger le pending avec lock (race condition)
    const pending = await tx.pointPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!pending || pending.status !== 'pending') {
      return null; // déjà traité par un autre appel concurrent
    }

    // 2. Marquer comme completed avec externalRef (unique constraint protège contre doublon)
    await tx.pointPurchase.update({
      where: { id: purchaseId },
      data: {
        status: 'completed',
        source: 'wave_business',
        externalRef,
        senderPhone,
        confirmedAt: new Date(),
      },
    });

    // 3. Créditer selon le type d'achat
    let pointsCredited = 0;

    if (pending.purchaseType === 'points') {
      // ─── ACHAT DE POINTS ───
      const pkg = POINT_PACKAGES.find((p) => p.id === pending.planId);
      pointsCredited = pkg?.points || 0;

      if (pointsCredited > 0) {
        await tx.user.update({
          where: { id: pending.userId },
          data: { points: { increment: pointsCredited } },
        });
      }
    } else if (pending.purchaseType === 'abonnement') {
      // ─── ACTIVATION D'ABONNEMENT ───
      const planId = pending.planId || 'gratuit';
      const planConfig = PLANS[planId as keyof typeof PLANS];

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      await tx.user.update({
        where: { id: pending.userId },
        data: { plan: planId },
      });

      await tx.subscription.create({
        data: {
          userId: pending.userId,
          plan: planId,
          priceFcfa: pending.amountFcfa,
          status: 'active',
          startDate: now,
          endDate,
        },
      });

      if (planConfig && planConfig.points > 0) {
        pointsCredited = planConfig.points;
        await tx.user.update({
          where: { id: pending.userId },
          data: { points: { increment: pointsCredited } },
        });
      }
    }

    return { pointsCredited };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT GET
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const requestId = `status_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  try {
    // 1. Authentifier l'utilisateur
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ status: 'forbidden' }, { status: 401 });
    }

    // 2. Récupérer le purchaseId
    const url = new URL(request.url);
    const purchaseId = url.searchParams.get('id');
    if (!purchaseId) {
      return NextResponse.json(
        { status: 'error', error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    // 3. Charger le pending
    const purchase = await db.pointPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return NextResponse.json({ status: 'not_found' });
    }

    // 4. Vérifier que le pending appartient à l'utilisateur
    if (purchase.userId !== user.id) {
      console.warn(
        `[PAYMENT-STATUS][${requestId}] User ${user.id} tried to access purchase ${purchaseId} owned by ${purchase.userId}`
      );
      return NextResponse.json({ status: 'forbidden' }, { status: 403 });
    }

    // 5. Si déjà confirmé/expired → retourner direct
    if (purchase.status === 'completed') {
      return NextResponse.json({
        status: 'confirmed',
        points: purchase.pointsAdded,
        purchase_type: purchase.purchaseType,
        confirmed_at: purchase.confirmedAt,
      });
    }

    if (purchase.status === 'expired' || purchase.status === 'rejected') {
      return NextResponse.json({ status: purchase.status });
    }

    // 6. Vérifier expiration (TTL 10 min)
    const expiresAt = purchase.expiresAt
      ? purchase.expiresAt
      : new Date(purchase.createdAt.getTime() + PENDING_TTL_MINUTES * 60_000);

    if (new Date() > expiresAt) {
      await db.pointPurchase.update({
        where: { id: purchaseId },
        data: { status: 'expired' },
      });
      return NextResponse.json({ status: 'expired' });
    }

    // 7. ⭐ Vérifier Wave Business (si configuré)
    if (isWaveBusinessConfigured()) {
      try {
        // Récupérer tous les externalRef déjà utilisés (anti-doublon)
        const usedRefs = await db.pointPurchase.findMany({
          where: { externalRef: { not: null } },
          select: { externalRef: true },
        });
        const usedExternalRefs = new Set(
          usedRefs.map((p) => p.externalRef!).filter(Boolean)
        );

        // Chercher une transaction Wave qui matche — le matching se fait
        // principalement par client_reference (= purchaseId) et non par montant,
        // pour empêcher le vol de paiement entre users.
        const match = await findMatchingTransaction(
          purchase.amountFcfa,
          purchase.createdAt,
          usedExternalRefs,
          purchase.id  // ← expectedClientReference : le pendingId est passé
                       //   dans l'URL Wave checkout via ?client_reference=<pendingId>
                       //   et Wave le renvoie dans la transaction (champ
                       //   clientReference sur MerchantSaleEntry).
        );

        if (match) {
          console.log(
            `[PAYMENT-STATUS][${requestId}] Match trouvé: tx=${match.id}, amount=${match.amount}, ` +
            `from=${match.senderPhone}, clientReference=${match.clientReference || '(none)'} ` +
            `(attendue: ${purchase.id})`
          );

          // Créditer atomiquement
          const result = await creditPurchase(purchaseId, match.id, match.senderPhone);

          if (result) {
            console.log(
              `[PAYMENT-STATUS][${requestId}] ✅ Crédité ${result.pointsCredited} points à user ${user.id} (transaction ${match.id})`
            );

            return NextResponse.json({
              status: 'confirmed',
              points: result.pointsCredited,
              purchase_type: purchase.purchaseType,
              external_ref: match.id,
            });
          } else {
            // Concurrent — déjà crédité par un autre appel
            return NextResponse.json({
              status: 'confirmed',
              points: purchase.pointsAdded,
              concurrent: true,
            });
          }
        }
      } catch (error) {
        if (error instanceof WaveSessionExpiredError) {
          console.warn(
            `[PAYMENT-STATUS][${requestId}] Wave session expired — returning pending`
          );
          return NextResponse.json({
            status: 'pending',
            warning: 'verification_delayed',
          });
        }
        console.error(`[PAYMENT-STATUS][${requestId}] Wave check error:`, error);
      }
    } else {
      console.warn(
        `[PAYMENT-STATUS][${requestId}] Wave Business non configuré — vérification impossible`
      );
    }

    // 8. Toujours pending
    const elapsed = Date.now() - startTime;
    console.log(
      `[PAYMENT-STATUS][${requestId}] Still pending (elapsed=${elapsed}ms)`
    );
    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error(`[PAYMENT-STATUS][${requestId}] Erreur non gérée:`, error);
    return NextResponse.json(
      { status: 'error', error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
