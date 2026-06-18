// ============================================================================
// WAKHMA STORE — Admin Alert (via WhatsApp / CallMeBot)
// ============================================================================
// Envoie des notifications WhatsApp à l'admin quand un événement critique se
// produit sur le serveur (ex: session Wave Business expirée).
//
// 📲 MÉTHODE : CallMeBot (gratuit, pour l'auto-notification admin uniquement)
// CallMeBot permet d'envoyer des WhatsApp à votre propre numéro via une API
// HTTP simple. Pas besoin de compte business WhatsApp.
//
// 🔧 SETUP (une seule fois, 3 min) :
// 1. Ouvre WhatsApp et ajoute le contact CallMeBot : +34 644 39 96 84
//    (ou va sur https://www.callmebot.com/blog/free-api-whatsapp-messages/)
// 2. Envoie-lui le message : "I allow callmebot to send me messages"
// 3. CallMeBot te répond avec ton API key (ex: "1234567")
// 4. Ajoute ces variables dans Vercel :
//    - CALLMEBOT_PHONE    = ton numéro au format international sans + (ex: "221761234567")
//    - CALLMEBOT_API_KEY  = l'API key reçue
//
// 🧪 TEST : une fois configuré, tu peux tester avec :
//    curl "https://api.callmebot.com/whatsapp.php?phone=221761234567&apikey=XXX&text=test"
//
// ⚠️ LIMITES CallMeBot (plan gratuit) :
// - Max ~30 messages / jour
// - Délai possible de 5-30s selon la charge
// - Suffisant pour des alertes critiques (session expirée = rare)
//
// Si CALLMEBOT_PHONE / CALLMEBOT_API_KEY ne sont pas configurés, on fallback
// silencieusement vers console.error — on ne fait jamais crasher l'app pour
// un problème d'alerte.
// ============================================================================

interface AlertPriority {
  readonly emoji: string;
  readonly prefix: string;
}

const PRIORITIES = {
  critical: { emoji: '🚨', prefix: 'CRITIQUE' },
  warning: { emoji: '⚠️', prefix: 'ALERTE' },
  info: { emoji: 'ℹ️', prefix: 'INFO' },
} as const;

type Priority = keyof typeof PRIORITIES;

/**
 * Envoie une alerte WhatsApp à l'admin via CallMeBot.
 *
 * @param message  Contenu de l'alerte (sans emoji ni préfixe, on les ajoute)
 * @param priority Niveau d'urgence (défaut: 'warning')
 *
 * @returns true si envoyé, false si échec (mais l'app ne crash jamais)
 */
export async function alertAdmin(
  message: string,
  priority: Priority = 'warning'
): Promise<boolean> {
  const { emoji, prefix } = PRIORITIES[priority];
  const fullMessage = `${emoji} WAKHMA STORE — ${prefix}\n\n${message}\n\n_${new Date().toISOString()}_`;

  // Logger toujours en console (au cas où WhatsApp échoue)
  console.log(`[ADMIN-ALERT][${prefix}] ${message}`);

  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  // Si pas configuré → on log et on rend la main
  if (!phone || !apiKey) {
    console.warn(
      '[ADMIN-ALERT] CallMeBot non configuré (CALLMEBOT_PHONE / CALLMEBOT_API_KEY manquants). ' +
      'Alerte WhatsApp ignorée — voir logs serveur.'
    );
    return false;
  }

  try {
    const url =
      `https://api.callmebot.com/whatsapp.php` +
      `?phone=${encodeURIComponent(phone)}` +
      `&apikey=${encodeURIComponent(apiKey)}` +
      `&text=${encodeURIComponent(fullMessage)}`;

    // Timeout de 10s pour ne pas bloquer la requête utilisateur trop longtemps
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(
        `[ADMIN-ALERT] CallMeBot HTTP ${response.status}: ${text.substring(0, 200)}`
      );
      return false;
    }

    console.log(`[ADMIN-ALERT] WhatsApp envoyé à ${phone}`);
    return true;
  } catch (error) {
    console.error('[ADMIN-ALERT] Échec envoi WhatsApp:', error);
    return false;
  }
}

/**
 * Vérifie si les alertes admin sont correctement configurées
 */
export function isAlertConfigured(): boolean {
  return !!(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_API_KEY);
}
