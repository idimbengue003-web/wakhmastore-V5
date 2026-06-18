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
// - WAVE_BUSINESS_API_KEY    : token API (ex: "US_tok_sn_03b36f96c9e448ae6cdad4fa9bcf74d1")
//                              → capturé via DevTools > Network > business_graphql
//                                > authorization header (base64 decoded)
// - WAVE_BUSINESS_WALLET_ID  : ID du wallet business (ex: "W_sn_LUvGY4hJVmNP")
//                              → capturé dans les variables de la requête GraphQL
//                                (champ walletOpaqueId)
// - WAVE_BUSINESS_USER_AGENT : User-Agent du navigateur utilisé (optionnel)
//
// 📋 RÉCUPÉRER LES IDENTIFIANTS (côté admin, une fois) :
// 1. Sur PC : F12 → Network → recharge business.wave.com (page Transactions)
// 2. Clic droit sur la requête business_graphql → Copy as cURL
// 3. Cherche le header "authorization: Basic XXX"
// 4. Décode XXX en base64 → tu obtiens ":US_tok_sn_..."
// 5. La partie après ":" est ta clé API → colle dans WAVE_BUSINESS_API_KEY
// 6. Dans le body JSON, cherche "walletOpaqueId":"W_sn_XXX"
//    → colle la valeur dans WAVE_BUSINESS_WALLET_ID
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
    walletOpaqueId: process.env.WAVE_BUSINESS_WALLET_ID || '',
    userAgent:
      process.env.WAVE_BUSINESS_USER_AGENT ||
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36',
  };
}

/**
 * Indique si le client Wave Business est configuré
 * (API key ET wallet ID présents en variables d'environnement)
 */
export function isWaveBusinessConfigured(): boolean {
  return !!(getConfig().apiKey && getConfig().walletOpaqueId);
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY GraphQL — HistoryEntries_BusinessWalletHistoryQuery
// ─────────────────────────────────────────────────────────────────────────────
//
// ✅ Query exacte capturée depuis business.wave.com > page Transactions
// via DevTools > Network > business_graphql > Copy as cURL.
//
// Cette query retourne l'historique des transactions du wallet business sur
// une période donnée. Les fragments (...) gèrent les différents types
// d'entrées (vente client, remboursement, transfert reçu, etc.)
//
// Pour WakhmaStore, ce qui nous intéresse principalement ce sont les
// `MerchantSaleEntry` (paiements reçus de la part de clients via Wave).
// -----------------------------------------------------------------------------

const HISTORY_QUERY = `query HistoryEntries_BusinessWalletHistoryQuery(
  $start: Date!
  $end: Date!
  $walletOpaqueId: String!
  $limit: Int
  $transactionId: String
  $customerMobileStr: String
  $searchTerm: String
  $surrogateEmployeeId: String
  $includePending: Boolean
  $transactionType: TransactionType
) {
  me {
    merchant {
      canRefund
      name
      id
    }
    businessUser {
      rolePermissions
      user {
        merchant {
          needsPinToRefund
          id
        }
        id
      }
      business {
        name
        showGrossAmount
        showSurrogateOptions
        walletHistory(start: $start, end: $end, walletOpaqueId: $walletOpaqueId, limit: $limit, transactionId: $transactionId, customerMobileStr: $customerMobileStr, surrogateEmployeeId: $surrogateEmployeeId, searchTerm: $searchTerm, includePending: $includePending, transactionType: $transactionType) {
          batches {
            __typename
            id
            totalCost
            whenCreated
            senderName
            senderMobile
          }
          historyEntries {
            __typename
            id
            summary
            whenEntered
            amount
            isPending
            isCancelled
            baseReceiptFields {
              formatType
              label
              value
            }
            ... on AgentTransactionEntry {
              agentTransactionId
              isDeposit
              agentName
              type
              atxCashierName: counterpartyNameOnly
              atxCashierMobile: customerMobile
            }
            ... on BillPaymentEntry {
              billName
              billAccount
              transferOpaqueId: transferId
            }
            ... on MerchantSaleEntry {
              isRefunded
              isCheckout
              clientReference
              transferId
              customerMobile: unmaskedSenderMobile
              customerName: senderName
              cashierName: merchantUName
              grossAmount
              feeAmount
              actionSource
              overrideBusinessName
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
              customFields {
                label
                value
              }
            }
            ... on MerchantSubAccountFundingEntry {
              fundingTransferId
              baseReceiptFields {
                label
                value
              }
              summary
              subAccountFundingMerchantName: sendingMerchantName
              receivingMerchantName
              isReversal
            }
            ... on MerchantRefundEntry {
              transferId
              customerMobile: unmaskedSenderMobile
              customerName: senderName
              cashierName: merchantUName
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
            }
            ... on PayoutTransferEntry {
              tcid
              maybeRecipientName: recipientName
              recipientMobile
              isReversal
              isReversed
              reversalSource
              grossAmount
            }
            ... on TransferReceivedReversalEntry {
              transferOpaqueId: transferId
              senderName
              senderMobile
            }
            ... on TransferSentEntry {
              isRefunded
              recipientName
              recipientMobile
              transferOpaqueId: transferId
            }
            ... on TransferSentReversalEntry {
              transferOpaqueId: transferId
              senderName
              senderMobile
            }
            ... on MerchantSweepSentEntry {
              sweepGrossVolume
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
            }
            ... on MerchantSweepReceivedEntry {
              sweepGrossVolume
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
              sendingMerchantName
            }
            ... on B2BPaymentEntry {
              transferId
              isReversed
              isReversal
              grossAmount
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
            }
            ... on RemittanceTransferReceivedEntry {
              opaqueId
              isReversed
              externalReference
            }
            ... on RemittanceTransferReversalEntry {
              opaqueId
            }
            ... on UserLinkedAccountTransferB2WEntry {
              liaTransferId
            }
            ... on UserLinkedAccountTransferW2BEntry {
              liaTransferId
            }
            ... on UserLinkedAccountTransferB2WEntryReversal {
              liaTransferId
            }
            ... on UserLinkedAccountTransferW2BEntryReversal {
              liaTransferId
            }
            ... on BusinessLoanDisbursementEntry {
              userFacingTransactionId
            }
            ... on BusinessLoanRepaymentEntry {
              userFacingTransactionId
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
// Format EXACT de la réponse (confirmé par la query capturée) :
// {
//   "data": {
//     "me": {
//       "businessUser": {
//         "business": {
//           "walletHistory": {
//             "historyEntries": [
//               {
//                 "__typename": "MerchantSaleEntry",  // ← ce qu'on veut
//                 "id": "...",
//                 "summary": "...",
//                 "whenEntered": "2025-01-15T10:30:00Z",
//                 "amount": 2000,                     // en FCFA
//                 "isPending": false,
//                 "isCancelled": false,
//                 "customerMobile": "+221761234567",  // (sur MerchantSaleEntry)
//                 "customerName": "...",
//                 "transferId": "..."
//               }
//             ]
//           }
//         }
//       }
//     }
//   }
// }
//
// On garde uniquement les entrées qui sont des ENCAISSEMENTS (paiements
// entrants vers le compte business) :
// - __typename === 'MerchantSaleEntry' (vente client via checkout/payment link)
// - isPending === false (transaction confirmée)
// - isCancelled === false (pas annulée)
// - amount > 0
//
// Les autres types (MerchantRefundEntry, PayoutTransferEntry, etc.) sont
// des sorties d'argent ou des remboursements — on les ignore.
// -----------------------------------------------------------------------------

function parseWaveResponse(data: any): WaveTransaction[] {
  const walletHistory =
    data?.data?.me?.businessUser?.business?.walletHistory ||
    data?.data?.me?.business?.walletHistory ||
    null;

  if (!walletHistory) {
    console.warn(
      '[WAVE-BUSINESS] Structure de réponse inattendue:',
      JSON.stringify(data).substring(0, 500)
    );
    return [];
  }

  const entries = walletHistory.historyEntries;
  if (!Array.isArray(entries)) return [];

  // Types d'entrées qui représentent des ENCAISSEMENTS (argent entrant)
  const INCOMING_TYPES = new Set([
    'MerchantSaleEntry',                  // Vente client (checkout, payment link, etc.)
    'RemittanceTransferReceivedEntry',    // Transfert reçu
    'MerchantSweepReceivedEntry',         // Sweep entrant
    'UserLinkedAccountTransferW2BEntry',  // Wallet → Business (incoming pour business)
  ]);

  return entries
    .map((entry: any): WaveTransaction | null => {
      try {
        if (!entry) return null;

        // Filtrer par type — on ne garde que les encaissements
        const typename = String(entry.__typename || '');
        if (!INCOMING_TYPES.has(typename)) return null;

        // Ignorer les transactions annulées
        if (entry.isCancelled === true) return null;

        // Ignorer les transactions en attente (pas encore confirmées)
        if (entry.isPending === true) return null;

        // Montant — sur MerchantSaleEntry, on peut avoir grossAmount ou amount
        const amount = Number(entry.grossAmount ?? entry.amount ?? 0);
        if (!amount || amount <= 0) return null;

        // ID — on utilise l'id de l'entry ou le transferId si disponible
        const id = String(
          entry.transferId || entry.id || entry.opaqueId || entry.transferOpaqueId || ''
        );
        if (!id) return null;

        // Numéro de téléphone du client (sur MerchantSaleEntry c'est customerMobile)
        const senderPhone =
          entry.customerMobile ||
          entry.senderMobile ||
          entry.atxCashierMobile ||
          entry.recipientMobile ||
          '';

        // Timestamp — whenEntered est le champ principal
        const timestampRaw = entry.whenEntered || entry.whenCreated;
        const timestamp = timestampRaw ? new Date(timestampRaw) : new Date();
        if (isNaN(timestamp.getTime())) return null;

        return {
          id,
          amount,
          senderPhone: String(senderPhone),
          timestamp,
          type: 'in' as const,
          rawText: JSON.stringify(entry).substring(0, 500), // limité pour économiser mémoire
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
  if (!config.walletOpaqueId) {
    throw new Error('WAVE_BUSINESS_WALLET_ID not configured');
  }

  // Construction du header Authorization: Basic base64(":" + apiKey)
  // Format observé : username vide, password = API key
  const basicAuth = Buffer.from(`:${config.apiKey}`).toString('base64');

  // Variables GraphQL — correspond exactement à la query capturée
  // Période : 7 derniers jours (suffisant pour matcher les paiements en attente
  // qui ont un TTL de 10 min, tout en évitant de charger trop de données)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Format Date attendu par GraphQL : "YYYY-MM-DD"
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const variables = {
    start: formatDate(weekAgo),
    end: formatDate(today),
    walletOpaqueId: config.walletOpaqueId,
    limit: 100,
    transactionId: null,
    customerMobileStr: null,
    searchTerm: null,
    surrogateEmployeeId: null,
    includePending: false, // on ne veut que les transactions confirmées
    transactionType: 'ALL', // on filtre côté parser (plus sûr)
  };

  console.log(
    `[WAVE-BUSINESS] Calling GraphQL endpoint (wallet=${config.walletOpaqueId}, period=${variables.start} → ${variables.end})`
  );

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
