// ============================================================================
// WAKHMA STORE — Wave Business API Client
// ============================================================================
// Client HTTP qui interroge l'API interne de business.wave.com pour récupérer
// les transactions entrantes et matcher les paiements en attente.
//
// ⚙️ FONCTIONNEMENT :
// - Utilise les cookies de session Wave Business (à fournir via env var)
// - Debounce global de 30s : un seul appel Wave toutes les 30s max
// - Cache mémoire entre les appels pour servir plusieurs polls utilisateur
// - Détection session expirée (HTTP 401) → alerte admin via WhatsApp
//
// 🔑 VARIABLES D'ENVIRONNEMENT REQUISES :
// - WAVE_BUSINESS_COOKIE    : cookies de session (Format: "key1=val1; key2=val2")
// - WAVE_BUSINESS_API_BASE  : ex "https://business.wave.com"
// - WAVE_BUSINESS_ACCOUNT_ID: identifiant du compte marchand (si nécessaire dans l'URL)
// - WAVE_BUSINESS_USER_AGENT: User-Agent du navigateur utilisé pour la capture (optionnel)
//
// 📋 RÉCUPÉRER LES COOKIES (côté admin, une fois toutes les 2-4 semaines) :
// 1. Sur PC : F12 → Network → recharge business.wave.com
// 2. Copie en cURL la requête vers /api/...transactions...
// 3. Ouvre le cURL, copie tout le bloc "Cookie: ..." → colle dans WAVE_BUSINESS_COOKIE
// ============================================================================

import { alertAdmin } from '@/lib/admin-alert';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface WaveTransaction {
  id: string;              // ID unique Wave (utilisé comme externalRef)
  amount: number;          // Montant en FCFA
  senderPhone: string;     // Numéro expéditeur (ex: "+22176XXXXXXX")
  timestamp: Date;         // Date de réception
  type: 'in' | 'out';      // 'in' = encaissement
  rawText?: string;        // Texte brut pour debug
}

export class WaveSessionExpiredError extends Error {
  constructor() {
    super('Wave Business session expired — admin action required');
    this.name = 'WaveSessionExpiredError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBOUNCE GLOBAL (cache 30s)
// ─────────────────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 30_000; // 30 secondes

let lastFetchAt = 0;
let cachedTransactions: WaveTransaction[] = [];
let lastFetchError: Error | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG (avec valeurs par défaut pour ne pas crasher si env manquant)
// ─────────────────────────────────────────────────────────────────────────────

function getConfig() {
  return {
    cookie: process.env.WAVE_BUSINESS_COOKIE || '',
    apiBase: process.env.WAVE_BUSINESS_API_BASE || 'https://business.wave.com',
    accountId: process.env.WAVE_BUSINESS_ACCOUNT_ID || '',
    userAgent:
      process.env.WAVE_BUSINESS_USER_AGENT ||
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  };
}

/**
 * Indique si le client Wave Business est configuré
 * (cookies présents en variable d'environnement)
 */
export function isWaveBusinessConfigured(): boolean {
  return !!getConfig().cookie;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSING DE LA RÉPONSE WAVE BUSINESS
// ─────────────────────────────────────────────────────────────────────────────
//
// ⚠️ À ADAPTER SELON LE FORMAT RÉEL DE L'API WAVE BUSINESS
// Cette fonction sera ajustée une fois qu'on aura capturé un vrai cURL
// de l'endpoint /api/transactions de business.wave.com
//
function parseWaveResponse(data: any): WaveTransaction[] {
  // Format probable (à confirmer avec le cURL) :
  // {
  //   "transactions": [
  //     {
  //       "id": "txn_abc123",
  //       "amount": 2000,
  //       "currency": "XOF",
  //       "direction": "in",
  //       "counterparty": { "msisdn": "+221761234567" },
  //       "created_at": "2025-01-15T10:30:00Z"
  //     }
  //   ]
  // }

  const transactions = data?.transactions || data?.data || data || [];
  if (!Array.isArray(transactions)) return [];

  return transactions
    .map((tx: any): WaveTransaction | null => {
      try {
        const amount = Number(tx.amount ?? tx.amount_fcfa ?? tx.value ?? 0);
        if (!amount) return null;

        const direction = String(tx.direction ?? tx.type ?? 'in').toLowerCase();
        if (direction !== 'in' && direction !== 'received' && direction !== 'credit') {
          return null;
        }

        const id = String(tx.id ?? tx.uuid ?? tx.reference ?? tx.tx_id ?? '');
        if (!id) return null;

        const senderPhone =
          tx.counterparty?.msisdn ||
          tx.counterparty?.phone ||
          tx.sender?.msisdn ||
          tx.sender_phone ||
          tx.from ||
          '';

        const timestampRaw =
          tx.created_at || tx.timestamp || tx.date || tx.received_at;
        const timestamp = timestampRaw ? new Date(timestampRaw) : new Date();
        if (isNaN(timestamp.getTime())) return null;

        return {
          id,
          amount,
          senderPhone: String(senderPhone),
          timestamp,
          type: 'in' as const,
          rawText: JSON.stringify(tx),
        };
      } catch {
        return null;
      }
    })
    .filter((tx): tx is WaveTransaction => tx !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// APPEL PRINCIPAL À WAVE BUSINESS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appelle l'API interne Wave Business pour récupérer les transactions récentes.
 *
 * 📌 TODO : ajuster l'URL exacte + headers selon le cURL capturé par l'admin.
 *           Actuellement, on suppose l'endpoint :
 *           GET {apiBase}/api/v1/accounts/{accountId}/transactions?limit=50
 */
async function fetchWaveTransactions(): Promise<WaveTransaction[]> {
  const config = getConfig();

  if (!config.cookie) {
    throw new Error('WAVE_BUSINESS_COOKIE not configured');
  }

  // Endpoint probable (à confirmer avec cURL)
  // On commence par un endpoint générique qui marche sur la plupart des dashboards
  const url = config.accountId
    ? `${config.apiBase}/api/v1/accounts/${config.accountId}/transactions?limit=50`
    : `${config.apiBase}/api/transactions?limit=50`;

  console.log(`[WAVE-BUSINESS] Fetching transactions from ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Cookie: config.cookie,
      'User-Agent': config.userAgent,
      Accept: 'application/json',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      Referer: config.apiBase + '/',
      'X-Requested-With': 'XMLHttpRequest',
    },
    cache: 'no-store',
  });

  // Détection session expirée → alerter admin
  if (response.status === 401 || response.status === 403) {
    console.error(`[WAVE-BUSINESS] Session expired (HTTP ${response.status})`);
    await alertAdmin(
      `⚠️ Session Wave Business expirée (HTTP ${response.status}). ` +
      `Reconnecte-toi sur business.wave.com et mets à jour WAVE_BUSINESS_COOKIE dans Vercel.`
    );
    throw new WaveSessionExpiredError();
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`[WAVE-BUSINESS] HTTP ${response.status}: ${text.substring(0, 500)}`);
    throw new Error(`Wave Business API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  const transactions = parseWaveResponse(data);
  console.log(`[WAVE-BUSINESS] Received ${transactions.length} transactions`);

  return transactions;
}

// ─────────────────────────────────────────────────────────────────────────────
// API PUBLIQUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère les transactions récentes Wave Business.
 * Applique le debounce global de 30s pour éviter de surcharger l'API Wave.
 *
 * Si le dernier fetch date de moins de 30s → retourne le cache.
 * Sinon → refetch et met à jour le cache.
 */
export async function getRecentTransactions(): Promise<WaveTransaction[]> {
  const now = Date.now();
  const age = now - lastFetchAt;

  // Cache encore valide
  if (age < DEBOUNCE_MS && !lastFetchError) {
    console.log(`[WAVE-BUSINESS] Using cached transactions (age=${age}ms)`);
    return cachedTransactions;
  }

  // Pas configuré : retourner vide (ne pas crasher)
  if (!isWaveBusinessConfigured()) {
    console.warn('[WAVE-BUSINESS] Not configured — WAVE_BUSINESS_COOKIE missing');
    return [];
  }

  // Refetch
  try {
    cachedTransactions = await fetchWaveTransactions();
    lastFetchAt = now;
    lastFetchError = null;
    return cachedTransactions;
  } catch (error) {
    lastFetchError = error as Error;

    // En cas d'erreur, on garde l'ancien cache s'il est récent (< 5 min)
    if (age < 5 * 60_000 && cachedTransactions.length > 0) {
      console.warn('[WAVE-BUSINESS] Fetch error, using stale cache');
      return cachedTransactions;
    }

    throw error;
  }
}

/**
 * Cherche une transaction Wave qui matche un pending.
 *
 * Critères de matching (tous obligatoires) :
 * 1. amount === expectedAmount (montant exact)
 * 2. timestamp >= since (créé après la création du pending)
 * 3. type === 'in' (encaissement)
 * 4. externalRef (id Wave) pas déjà utilisé par un autre PointPurchase
 *
 * @param expectedAmount Montant exact attendu en FCFA
 * @param since Date minimale de la transaction
 * @param usedExternalRefs IDs Wave déjà utilisés (pour anti-doublon)
 */
export async function findMatchingTransaction(
  expectedAmount: number,
  since: Date,
  usedExternalRefs: Set<string>
): Promise<WaveTransaction | null> {
  const transactions = await getRecentTransactions();

  // Filtrer par montant + date + type
  const candidates = transactions.filter(
    (tx) =>
      tx.amount === expectedAmount &&
      tx.timestamp >= since &&
      tx.type === 'in' &&
      !usedExternalRefs.has(tx.id)
  );

  if (candidates.length === 0) return null;

  // Si plusieurs candidats, prendre le plus récent
  candidates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return candidates[0];
}

/**
 * Force un refresh du cache (utile pour les tests ou après une action admin)
 */
export function invalidateCache(): void {
  lastFetchAt = 0;
  cachedTransactions = [];
  lastFetchError = null;
}
