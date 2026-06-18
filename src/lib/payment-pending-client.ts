// ============================================================================
// Helper : créer un pending payment avant redirection vers la page de paiement
// ============================================================================
//
// ⚠️ DEPUIS LE 19/06/2026 — LA PASSERELLE EXTERNE N'EST PLUS UTILISÉE.
//
// Raison : la passerelle (payment-gateway-beige-ten.vercel.app) est un projet
// Vercel sans Git, donc non déployable. De plus, son callback HMAC
// (/api/payment-callback) matchait l'utilisateur par numéro de téléphone —
// mais le format téléphonique ne correspondait jamais (DB : "77 123 45 67",
// passerelle : "771234567"), donc AUCUN paiement n'était jamais crédité.
//
// Nouveau flux (100% interne à wakhmastore.com) :
// 1. Frontend appelle /api/payment-pending → crée un PointPurchase pending
// 2. Frontend redirige vers /paiement/confirmation?pending=<id>&montant=<m>&...
// 3. La page /paiement/confirmation affiche le montant + le numéro marchand Wave
// 4. L'utilisateur ouvre Wave, envoie l'argent au numéro affiché
// 5. La page poll /api/payment-status?id=<pending> toutes les 3s
// 6. /api/payment-status interroge l'API Wave Business (GraphQL) toutes les 30s
// 7. Dès qu'une transaction entrante de ±10 FCFA est trouvée → crédit atomique
// 8. La page affiche "Paiement confirmé" + points crédités
//
// Avantages :
// - Plus besoin de la passerelle externe (un projet Vercel de moins à gérer)
// - Plus besoin de détection SMS (Automate/MacroDroid)
// - Plus de bug de matching téléphone (on a l'userId depuis la session)
// - Tout est dans le repo Git wakhmastore-V5, donc déployable normalement
// ============================================================================

import { PLANS, POINT_PACKAGES } from '@/lib/constants';

interface CreatePendingOptions {
  planId: string;
  amount: number;
  type: 'abonnement' | 'points';
}

interface CreatePendingResult {
  success: boolean;
  pendingId?: string;
  paymentUrl: string;
  error?: string;
}

/**
 * Crée un enregistrement pending en DB puis retourne l'URL interne de la page
 * de confirmation/paiement. À appeler AVANT de rediriger l'utilisateur.
 *
 * L'URL retournée est du type :
 *   /paiement/confirmation?pending=<id>&montant=<m>&plan=<planId>&points=<p>
 *
 * La page /paiement/confirmation gère ensuite l'affichage des instructions
 * de paiement (montant + numéro marchand) et le polling automatique.
 */
export async function createPendingPayment({
  planId,
  amount,
  type,
}: CreatePendingOptions): Promise<CreatePendingResult> {
  try {
    const res = await fetch('/api/payment-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, amount, type }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn('[createPendingPayment] Erreur:', data.error);
      // En cas d'erreur, rediriger quand même vers la page de confirmation
      // sans pending ID — l'utilisateur verra l'état "inconnu" et pourra
      // réessayer.
      return { success: false, paymentUrl: '/paiement/confirmation', error: data.error };
    }

    // Construire l'URL interne avec tous les paramètres nécessaires
    const params = new URLSearchParams();
    params.set('pending', data.pendingId);
    params.set('montant', String(amount));
    params.set('plan', planId);

    // Pour les achats de points, passer le nombre de points pour l'affichage
    if (type === 'points') {
      const pkg = POINT_PACKAGES.find((p) => p.id === planId);
      if (pkg) params.set('points', String(pkg.points));
    }

    // Pour les abonnements, indiquer que c'est un abonnement (la page utilisera
    // le paramètre `plan` pour afficher "Abonnement activé" au lieu de "+X pts")
    if (type === 'abonnement') {
      params.set('type', 'abonnement');
    }

    const paymentUrl = `/paiement/confirmation?${params.toString()}`;

    return {
      success: true,
      pendingId: data.pendingId,
      paymentUrl,
    };
  } catch (err) {
    console.error('[createPendingPayment] Exception:', err);
    return {
      success: false,
      paymentUrl: '/paiement/confirmation',
      error: 'Erreur réseau',
    };
  }
}
