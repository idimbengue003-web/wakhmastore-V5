// ============================================================================
// Helper : créer un pending payment avant redirection vers Wave
// ============================================================================

import { getSubscriptionPaymentUrl, getPointsPaymentUrl } from '@/lib/constants';

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
 * Crée un enregistrement pending en DB puis retourne l'URL de paiement Wave.
 * À appeler AVANT de rediriger l'utilisateur vers la page de paiement.
 */
export async function createPendingPayment({
  planId,
  amount,
  type,
}: CreatePendingOptions): Promise<CreatePendingResult> {
  const paymentUrl = type === 'abonnement'
    ? getSubscriptionPaymentUrl(planId)
    : getPointsPaymentUrl(planId);

  try {
    const res = await fetch('/api/payment-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, amount, type }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn('[createPendingPayment] Erreur:', data.error);
      // On redirige quand même vers la page de paiement — le matching pourrait
      // encore fonctionner si l'utilisateur a déjà un pending récent pour ce montant
      return { success: false, paymentUrl, error: data.error };
    }

    // Ajouter le pendingId dans l'URL de retour pour le tracking
    const returnUrl = encodeURIComponent(
      `https://www.wakhmastore.com/paiement/confirmation?pending=${data.pendingId}`
    );
    // Remplacer le callback_url existant dans l'URL
    const finalUrl = paymentUrl.replace(
      /callback_url=[^&]+/,
      `callback_url=${returnUrl}`
    );

    return {
      success: true,
      pendingId: data.pendingId,
      paymentUrl: finalUrl,
    };
  } catch (err) {
    console.error('[createPendingPayment] Exception:', err);
    return { success: false, paymentUrl, error: 'Erreur réseau' };
  }
}
