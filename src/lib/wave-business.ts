// ============================================================================
// WAKHMA STORE — Wave Business GraphQL Client
// ============================================================================
// Client HTTP qui interroge l'API GraphQL interne de Wave Business pour
// récupérer les transactions entrantes et matcher les paiements en attente.
//
// ⚙️ FONCTIONNEMENT :
// - Utilise une API key statique (US_tok_sn_...) — pas de cookies à rafraîchir
// - Debounce global de 30s : un seul appel Wave toutes les 30s max
// - Cache mémoire entre les appels pour servir plusieurs polls utilisateur
// - Détection session expirée (HTTP 401) → alerte admin via WhatsApp
//
// 🔑 VARIABLES D'ENVIRONNEMENT REQUISES :
// - WAVE_BUSINESS_API_KEY   : token API (ex: "US_tok_sn_03b36f96c9e448ae6cdad4fa9bcf74d1")
//                             → capturé via DevTools > Network > business_graphql
//                               > authorization header (base64 decoded)
// - WAVE_BUSINESS_USER_AGENT: User-Agent du navigateur utilisé (optionnel)
//
// 📋 RÉCUPÉRER L'API KEY (côté admin, une fois) :
// 1. Sur PC : F12 → Network → recharge business.wave.com (page Transactions)
// 2. Clic droit sur la requête business_graphql → Copy as cURL
// 3. Cherche le header "authorization: Basic XXX"
// 4. Décode XXX en base64 → tu obtiens ":US_tok_sn_..."
// 5. La partie après ":" est ta clé API → colle dans WAVE_BUSINESS_API_KEY
//
// 🌐 ENDPOINT :
// - URL: https://sn.mmapp.wave.com/a/business_graphql
// - Méthode: POST
// - Auth: Basic (username vide, password = API key)
// - Content-Type: application/json
// - Body: { query: "...", variables: {...} }
//
// 📊 QUERY UTILISÉE :
// - HistoryEntries_BusinessWalletHistoryQuery (à confirmer avec la capture
//   de la vraie requête GraphQL de la page Transactions)
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
    super('Wave Business API key expired or invalid — admin action required');
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
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const WAVE_GRAPHQL_URL = 'https://sn.mmapp.wave.com/a/business_graphql';

function getConfig() {
  return {
    apiKey: process.env.WAVE_BUSINESS_API_KEY || '',
    userAgent:
      process.env.WAVE_BUSINESS_USER_AGENT ||
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36',
  };
}

/**
 * Indique si le client Wave Business est configuré
 * (API key présente en variable d'environnement)
 */
export function isWaveBusinessConfigured(): boolean {
  return !!getConfig().apiKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY GraphQL
// ─────────────────────────────────────────────────────────────────────────────
//
// ⚠️ TODO : cette query est estimée. Il faut la remplacer par la VRAIE query
// capturée depuis business.wave.com > page Transactions > DevTools > Network.
//
// D'après les observations, la query s'appelle probablement :
//   HistoryEntries_BusinessWalletHistoryQuery
//
// Une fois qu'on aura le cURL complet de cette requête, on remplacera
// HISTORY_QUERY par la query exacte.
// -----------------------------------------------------------------------------

const HISTORY_QUERY = `
query HistoryEntries_BusinessWalletHistoryQuery(
  $first: Int
  $after: String
  $filter: TransactionFilter
) {
  me {
    businessUser {
      business {
        transactions(first: $first, after: $after, filter: $filter) {
          edges {
            node {
              id
              amount
              currency
              direction
              whenCreated
              counterparty {
                msisdn
              }
            }
          }
        }
        id
      }
      id
    }
    id
  }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// PARSING DE LA RÉPONSE GRAPHQL
// ─────────────────────────────────────────────────────────────────────────────
//
// Format probable de la réponse GraphQL :
// {
//   "data": {
//     "me": {
//       "businessUser": {
//         "business": {
//           "transactions": {
//             "edges": [
//               {
//                 "node": {
//                   "id": "...",
//                   "amount": 2000,
//                   "currency": "XOF",
//                   "direction": "INCOMING",
//                   "whenCreated": "2025-01-15T10:30:00Z",
//                   "counterparty": { "msisdn": "+221761234567" }
//                 }
//               }
//             ]
//           }
//         }
//       }
//     }
//   }
// }
//
// ⚠️ À AJUSTER une fois qu'on aura la vraie réponse.
// -----------------------------------------------------------------------------

function parseWaveResponse(data: any): WaveTransaction[] {
  // Navigation flexible dans la structure GraphQL
  const txConnection =
    data?.data?.me?.businessUser?.business?.transactions ||
    data?.data?.me?.business?.transactions ||
    data?.data?.transactions ||
    null;

  if (!txConnection) {
    console.warn('[WAVE-BUSINESS] Structure de réponse inattendue:', JSON.stringify(data).substring(0, 500));
    return [];
  }

  const edges = txConnection.edges || txConnection.nodes || txConnection || [];
  if (!Array.isArray(edges)) return [];

  return edges
    .map((edge: any): WaveTransaction | null => {
      try {
        const tx = edge.node || edge;

        const amount = Number(tx.amount ?? tx.amountFcfa ?? tx.value ?? 0);
        if (!amount) return null;

        const direction = String(tx.direction ?? tx.type ?? '').toUpperCase();
        const isIncoming =
          direction === 'INCOMING' ||
          direction === 'IN' ||
          direction === 'RECEIVED' ||
          direction === 'CREDIT';
        if (!isIncoming) return null;

        const id = String(tx.id ?? tx.uuid ?? tx.reference ?? tx.txId ?? '');
        if (!id) return null;

        const senderPhone =
          tx.counterparty?.msisdn ||
          tx.counterparty?.phone ||
          tx.sender?.msisdn ||
          tx.senderPhone ||
          tx.from ||
          '';

        const timestampRaw = tx.whenCreated || tx.createdAt || tx.timestamp || tx.date;
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
// APPEL PRINCIPAL À WAVE BUSINESS (GraphQL POST)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchWaveTransactions(): Promise<WaveTransaction[]> {
  const config = getConfig();

  if (!config.apiKey) {
    throw new Error('WAVE_BUSINESS_API_KEY not configured');
  }

  // Construction du header Authorization: Basic base64(":" + apiKey)
  // Format observé : username vide, password = API key
  const basicAuth = Buffer.from(`:${config.apiKey}`).toString('base64');

  // Variables : on demande les 50 dernières transactions
  const variables = {
    first: 50,
    filter: {
      // Si possible, filtrer par direction incoming uniquement
      // (à ajuster selon le schéma GraphQL réel)
    },
  };

  console.log(`[WAVE-BUSINESS] Calling GraphQL endpoint`);

  const response = await fetch(WAVE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://business.wave.com',
      Referer: 'https://business.wave.com/',
      'User-Agent': config.userAgent,
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
    body: JSON.stringify({
      query: HISTORY_QUERY,
      variables,
    }),
    cache: 'no-store',
  });

  // Détection session expirée → alerter admin
  if (response.status === 401 || response.status === 403) {
    console.error(`[WAVE-BUSINESS] Auth failed (HTTP ${response.status})`);
    await alertAdmin(
      `⚠️ Clé API Wave Business invalide ou expirée (HTTP ${response.status}). ` +
      `Reconnecte-toi sur business.wave.com, capture la nouvelle clé API et mets à jour WAVE_BUSINESS_API_KEY dans Vercel.`
    );
    throw new WaveSessionExpiredError();
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`[WAVE-BUSINESS] HTTP ${response.status}: ${text.substring(0, 500)}`);
    throw new Error(`Wave Business API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  // Vérifier les erreurs GraphQL
  if (data?.errors?.length > 0) {
    console.error('[WAVE-BUSINESS] GraphQL errors:', JSON.stringify(data.errors).substring(0, 500));
    // Si l'erreur est liée à l'auth, alerter
    if (data.errors.some((e: any) => String(e.message).toLowerCase().includes('unauthorized') ||
                                       String(e.message).toLowerCase().includes('auth'))) {
      await alertAdmin(
        `⚠️ Erreur d'authentification Wave Business (GraphQL). ` +
        `Vérifie ta clé API dans Vercel. Détails: ${data.errors[0]?.message}`
      );
      throw new WaveSessionExpiredError();
    }
    // Sinon on continue avec un tableau vide
    return [];
  }

  const transactions = parseWaveResponse(data);
  console.log(`[WAVE-BUSINESS] Received ${transactions.length} incoming transactions`);

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
    console.warn('[WAVE-BUSINESS] Not configured — WAVE_BUSINESS_API_KEY missing');
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
