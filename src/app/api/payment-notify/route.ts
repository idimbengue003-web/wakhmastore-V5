// ============================================================================
// WAKHMA STORE — /api/payment-notify
// ============================================================================
// Endpoint appelé par AUTOMATE (LlamaLab) sur le téléphone marchand.
// Automate intercepte les notifications Wave / SMS Wave / SMS Orange Money
// et envoie les données ici pour créditer automatiquement les points/abonnement.
//
// Authentification : token secret dans l'URL (?token=XXX)
//   → configuré via env var PAYMENT_AUTOMATE_TOKEN sur Vercel
//
// Body attendu (JSON) :
// {
//   "montant": 2000,                      // obligatoire — montant en FCFA
//   "sender_phone": "761234567",          // optionnel — téléphone du client
//   "ref": "WV-AB123456",                 // optionnel — référence Wave
//   "source": "wave_notification",        // optionnel — pour audit
//   "raw_text": "Vous avez recu 2000..."  // optionnel — texte brut reçu
// }
//
// Logique de matching :
//   1. Chercher les PointPurchase pending avec amountFcfa == montant
//   2. Si sender_phone fourni → filtrer par user.phone qui matche
//   3. Sinon → prendre le plus ancien pending non expiré
//   4. Créditer le plan/points + marquer comme completed
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLANS, POINT_PACKAGES } from '@/lib/constants';

// Token secret partagé avec Automate (configuré dans Vercel env vars)
const AUTOMATE_TOKEN = process.env.PAYMENT_AUTOMATE_TOKEN || 'wakhma_automate_secret_change_me_2025';

// Durée max d'un pending (en minutes) — au-delà, on ne matche plus
const MAX_PENDING_AGE_MINUTES = 30;

export async function POST(request: NextRequest) {
  const requestId = `notify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[PAYMENT-NOTIFY][${requestId}] Reçu appel Automate`);

  try {
    // ── ÉTAPE 1: Vérifier le token ─────────────────────────────────────────
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token || token !== AUTOMATE_TOKEN) {
      console.error(`[PAYMENT-NOTIFY][${requestId}] Token invalide`);
      return NextResponse.json(
        { success: false, error: 'Token invalide ou manquant' },
        { status: 401 }
      );
    }

    // ── ÉTAPE 2: Parser le body ────────────────────────────────────────────
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Body JSON invalide' },
        { status: 400 }
      );
    }

    const {
      montant,
      sender_phone,
      ref,
      source = 'automate_unknown',
      raw_text = '',
    } = body;

    console.log(`[PAYMENT-NOTIFY][${requestId}] Données: montant=${montant}, phone=${sender_phone}, ref=${ref}, source=${source}, raw_text="${raw_text}"`);

    // ── ÉTAPE 3: Déterminer le montant (extraire depuis raw_text si nécessaire) ──
    let montantNum = Number(montant);
    let extractedPhone = sender_phone || '';
    let extractedRef = ref || '';

    // Si montant manquant ou invalide, l'extraire depuis raw_text
    if ((!montantNum || montantNum < 100 || montantNum > 1000000) && raw_text) {
      console.log(`[PAYMENT-NOTIFY][${requestId}] Montant manquant — extraction depuis raw_text...`);

      // Patterns supportés (par ordre de priorité) :
      // 1. "ENCAISSEMENT DE 1300F" (Wave Business)
      // 2. "recu 2000 FCFA" ou "recus 2000 FCFA" ou "recue 2000 FCFA"
      // 3. "2000 FCFA" tout court
      // 4. "2000 F" tout court (si pas de FCFA)
      const patterns = [
        /ENCAISSEMENT\s+DE\s+(\d[\d\s.]*)\s*F/i,
        /re[cç]u\w*\s+(\d[\d\s.]*)\s*FCFA/i,
        /(\d[\d\s.]*)\s*FCFA/i,
        /(\d[\d\s.]*)\s*F\b/i,
      ];

      for (const pattern of patterns) {
        const match = String(raw_text).match(pattern);
        if (match && match[1]) {
          const cleaned = match[1].replace(/[\s.]/g, '');
          const parsed = Number(cleaned);
          if (parsed >= 100 && parsed <= 1000000) {
            montantNum = parsed;
            console.log(`[PAYMENT-NOTIFY][${requestId}] Montant extrait via ${pattern}: ${montantNum}`);
            break;
          }
        }
      }
    }

    // Si téléphone manquant, l'extraire depuis raw_text
    if (!extractedPhone && raw_text) {
      // Chercher un numéro de téléphone (au moins 8 chiffres)
      const phoneMatch = String(raw_text).match(/(\+?\d[\d\s]{7,})/);
      if (phoneMatch && phoneMatch[1]) {
        // Mais éviter de prendre le montant comme téléphone
        const candidate = phoneMatch[1].replace(/[\s+]/g, '');
        if (candidate.length >= 8 && Number(candidate) !== montantNum) {
          extractedPhone = phoneMatch[1].trim();
          console.log(`[PAYMENT-NOTIFY][${requestId}] Téléphone extrait: ${extractedPhone}`);
        }
      }
    }

    // Si référence manquante, l'extraire depuis raw_text
    if (!extractedRef && raw_text) {
      const refMatch = String(raw_text).match(/(?:Ref|Réf|Reference|Transaction)[:\s#]*([A-Z0-9-]{4,})/i);
      if (refMatch && refMatch[1]) {
        extractedRef = refMatch[1];
        console.log(`[PAYMENT-NOTIFY][${requestId}] Référence extraite: ${extractedRef}`);
      }
    }

    // Validation finale du montant
    if (!montantNum || montantNum < 100 || montantNum > 1000000) {
      console.error(`[PAYMENT-NOTIFY][${requestId}] Montant invalide après parsing: montant=${montant}, raw_text="${raw_text}"`);
      return NextResponse.json(
        {
          success: false,
          error: `Montant invalide ou introuvable dans raw_text. montant=${montant}, raw_text="${raw_text?.substring(0, 200)}"`,
        },
        { status: 400 }
      );
    }

    const finalPhone = extractedPhone;

    // ── ÉTAPE 4: Chercher le pending qui matche ────────────────────────────
    // Date d'expiration : on prend les pendings créés dans les 30 dernières minutes
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - MAX_PENDING_AGE_MINUTES);

    // Construire la requête de matching
    const whereClause: any = {
      status: 'pending',
      amountFcfa: montantNum,
      createdAt: { gte: cutoffDate },
    };

    // Si sender_phone fourni, essayer d'abord de matcher par téléphone user
    let pending: any = null;
    let matchedByPhone = false;

    if (finalPhone) {
      // Nettoyer le numéro (enlever espaces, +, etc.)
      const cleanPhone = String(finalPhone).replace(/[\s+\-]/g, '');
      const last8 = cleanPhone.slice(-8);
      console.log(`[PAYMENT-NOTIFY][${requestId}] Recherche par phone: clean=${cleanPhone}, last8=${last8}`);

      // Trouver les users dont le phone matche
      const matchingUsers = await db.user.findMany({
        where: {
          OR: [
            { phone: { contains: last8 } },
            { phone: { contains: cleanPhone } },
          ],
        },
        select: { id: true, phone: true },
      });

      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map(u => u.id);
        pending = await db.pointPurchase.findFirst({
          where: {
            ...whereClause,
            userId: { in: userIds },
          },
          orderBy: { createdAt: 'asc' }, // le plus ancien d'abord
          include: { user: true },
        });

        if (pending) {
          matchedByPhone = true;
          console.log(`[PAYMENT-NOTIFY][${requestId}] Match par téléphone réussi: user=${pending.user.phone}`);
        }
      }
    }

    // Si pas matché par téléphone, prendre le plus ancien pending non expiré
    if (!pending) {
      pending = await db.pointPurchase.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      });

      if (pending) {
        console.log(`[PAYMENT-NOTIFY][${requestId}] Match par montant seul (FIFO): user=${pending.user.phone}`);
      }
    }

    // ── ÉTAPE 5: Si aucun pending trouvé ───────────────────────────────────
    if (!pending) {
      console.warn(`[PAYMENT-NOTIFY][${requestId}] Aucun pending pour montant=${montantNum} FCFA`);
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun paiement en attente pour ce montant',
          montant: montantNum,
          searched_minutes: MAX_PENDING_AGE_MINUTES,
        },
        { status: 404 }
      );
    }

    // ── ÉTAPE 6: Vérifier qu'il n'est pas déjà traité (race condition) ────
    // Recharger avec lock explicite
    const freshPending = await db.pointPurchase.findUnique({
      where: { id: pending.id },
    });

    if (!freshPending || freshPending.status !== 'pending') {
      console.log(`[PAYMENT-NOTIFY][${requestId}] Pending ${pending.id} déjà traité — skip`);
      return NextResponse.json({
        success: true,
        message: 'Paiement déjà traité',
        pendingId: pending.id,
      });
    }

    // ── ÉTAPE 7: Créditer les points/abonnement ────────────────────────────
    const user = pending.user;
    let pointsAdded = 0;

    if (pending.purchaseType === 'points') {
      // ═══════════════════════════════════════════════════════════════════════
      // ACHAT DE POINTS
      // ═══════════════════════════════════════════════════════════════════════
      const pkg = POINT_PACKAGES.find(p => p.id === pending.planId);
      pointsAdded = pkg?.points || 0;

      if (pointsAdded > 0) {
        await db.user.update({
          where: { id: user.id },
          data: { points: { increment: pointsAdded } },
        });

        console.log(`[PAYMENT-NOTIFY][${requestId}] +${pointsAdded} points crédités à ${user.phone}`);
      }

    } else if (pending.purchaseType === 'abonnement') {
      // ═══════════════════════════════════════════════════════════════════════
      // ACTIVATION D'ABONNEMENT
      // ═══════════════════════════════════════════════════════════════════════
      const planId = pending.planId || 'gratuit';
      const planConfig = PLANS[planId as keyof typeof PLANS];
      const subDays = 30;

      // Calculer la date de fin
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + subDays);

      // Activer le plan de l'utilisateur
      await db.user.update({
        where: { id: user.id },
        data: { plan: planId },
      });

      // Créer l'enregistrement Subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: planId,
          priceFcfa: montantNum,
          status: 'active',
          startDate: now,
          endDate,
        },
      });

      // Créditer aussi les points inclus dans le plan
      if (planConfig && planConfig.points > 0) {
        pointsAdded = planConfig.points;
        await db.user.update({
          where: { id: user.id },
          data: { points: { increment: pointsAdded } },
        });
      }

      console.log(`[PAYMENT-NOTIFY][${requestId}] Abonnement ${planId} activé pour ${user.phone} jusqu'au ${endDate.toISOString()} + ${pointsAdded} points`);
    }

    // ── ÉTAPE 8: Marquer le pending comme completed ────────────────────────
    await db.pointPurchase.update({
      where: { id: pending.id },
      data: {
        status: 'completed',
        pointsAdded,
        source,
        senderPhone: finalPhone || null,
        externalRef: extractedRef || null,
        confirmedAt: new Date(),
      },
    });

    // ── ÉTAPE 9: Réponse de succès ─────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'Paiement traité avec succès',
      pendingId: pending.id,
      userId: user.id,
      phone: user.phone,
      montant: montantNum,
      planId: pending.planId,
      purchaseType: pending.purchaseType,
      points_credited: pointsAdded,
      matched_by: matchedByPhone ? 'phone' : 'amount_fifo',
      source,
      confirmed_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`[PAYMENT-NOTIFY][${requestId}] Erreur:`, error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET : retourne des infos de debug (sans exposer le token)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token || token !== AUTOMATE_TOKEN) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }

  // Compter les pendings actifs
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - MAX_PENDING_AGE_MINUTES);

  const pendingCount = await db.pointPurchase.count({
    where: {
      status: 'pending',
      createdAt: { gte: cutoff },
    },
  });

  return NextResponse.json({
    success: true,
    service: 'payment-notify',
    pending_count: pendingCount,
    pending_ttl_minutes: MAX_PENDING_AGE_MINUTES,
    timestamp: new Date().toISOString(),
  });
}
