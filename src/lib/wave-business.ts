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
// - WAVE_BUSINESS_API_KEY    : token API (format: "US_tok_sn_<random>")
//                              → capturé via DevTools > Network > business_graphql
//                                > authorization header (base64 decoded)
// - WAVE_BUSINESS_WALLET_ID  : ID du wallet business (format: "W_sn_<random>")
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
// ⚠️ NE JAMAIS committer la vraie clé API dans le repo. Utilise Vercel env vars.
//    Si la clé fuite, la révoquer immédiatement sur business.wave.com.
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
  clientReference?: string; // ⚠️ Référence client passée dans l'URL de checkout
                            //    (?client_reference=XXX). C'est elle qui permet
                            //    de matcher de façon UNIVOQUE un paiement à un
                            //    pending wakhmastore — SANS elle, on risquerait
                            //    d'attribuer le paiement d'un user à un autre.
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

        // ⚠️ Montant — l'API Wave renvoie le montant sous forme de STRING
        // formatée "CFA 2500", "CFA 1.300", "2.500F" etc. (pas un nombre).
        // Number("CFA 2500") => NaN => il faut extraire les digits.
        const amount = parseAmount(entry.grossAmount ?? entry.amount);
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

        // ⚠️ clientReference — la référence client passée dans l'URL de checkout
        // Wave Business (paramètre ?client_reference=XXX). C'est CE champ qui
        // permet de matcher un paiement à UN pending wakhmastore précis, sans
        // ambiguïté. Sur MerchantSaleEntry uniquement.
        const clientReference = entry.clientReference
          ? String(entry.clientReference).trim()
          : '';

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
          clientReference: clientReference || undefined,
          rawText: JSON.stringify(entry).substring(0, 500), // limité pour économiser mémoire
        };
      } catch {
        return null;
      }
    })
    .filter((tx): tx is WaveTransaction => tx !== null);
}

/**
 * Parse un montant Wave qui peut arriver sous plusieurs formes :
 * - "CFA 2500"     → 2500
 * - "CFA 1.300"    → 1300  (séparateur de milliers français)
 * - "2.500F"       → 2500
 * - "CFA 2500 F"   → 2500
 * - 2500 (nombre)  → 2500
 * - "-CFA 5000"    → -5000 (utile pour détecter les sorties, même si on filtre ensuite)
 *
 * Renvoie 0 si non parsable.
 */
function parseAmount(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  const str = String(value).trim();
  if (!str) return 0;

  // Retirer tout ce qui n'est pas un chiffre ou un signe moins
  // (gère "CFA 2.500F", "CFA 2500", "2,500 FCFA", "-CFA 5000", etc.)
  const cleaned = str
    .replace(/CFA/gi, '')
    .replace(/FCFA/gi, '')
    .replace(/XOF/gi, '')
    .replace(/F\b/g, '')
    .replace(/\s+/g, '')
    // Séparateurs de milliers : retirer les points et les virgules non significatifs
    .replace(/[.,](?=\d{3}\b)/g, '')   // "1.300" → "1300", "2,500" → "2500"
    .replace(/[.,](?=\d{3}(?!\d))/g, ''); // cas "12.345" → "12345"

  // Maintenant on doit avoir une string type "2500" ou "-5000"
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
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
 * 🔐 ALGORITHME DE MATCHING (sécurité critique) :
 *
 *   1. **Filtre principal — clientReference === expectedClientReference**
 *      On vérifie d'abord que la transaction a été initiée via le checkout
 *      Wave Business avec la bonne `?client_reference=<pendingId>`. C'est ce
 *      qui garantit que la transaction a BIEN été payée POUR ce pending
 *      précis, et empêche le vol de paiement (un user A ne peut pas voler
 *      les points du pending du user B même s'ils ont le même montant).
 *
 *   2. **Sanity check — montant à ±10 FCFA**
 *      Vérification secondaire pour détecter une éventuelle corruption ou
 *      tentative de manipulation. La tolérance de ±10 FCFA couvre la
 *      variation de +1/+2 FCFA que Wave ajoute parfois pour l'unicité.
 *
 *   3. **Filtre temporel — timestamp >= since**
 *      La transaction doit avoir eu lieu APRÈS la création du pending.
 *
 *   4. **Anti-doublon — id pas dans usedExternalRefs**
 *      Une même transaction Wave ne peut pas créditer 2 pendings différents.
 *
 * @param expectedAmount          Montant attendu en FCFA (sanity check)
 * @param since                   Date minimale de la transaction
 * @param usedExternalRefs        IDs Wave déjà utilisés (anti-doublon)
 * @param expectedClientReference La client_reference (= pendingId wakhmastore)
 *                                que la transaction doit avoir.
 *                                ⚠️ OBLIGATOIRE — sans ça, aucun match possible.
 */
const AMOUNT_TOLERANCE_FCFA = 10;

export async function findMatchingTransaction(
  expectedAmount: number,
  since: Date,
  usedExternalRefs: Set<string>,
  expectedClientReference: string
): Promise<WaveTransaction | null> {
  if (!expectedClientReference) {
    console.error('[WAVE-BUSINESS] findMatchingTransaction appelé sans expectedClientReference — REFUS');
    return null;
  }

  const transactions = await getRecentTransactions();

  // ── Filtre 1 (principal) : client_reference exact ──────────────────────
  // C'est ce filtre qui empêche le vol de paiement entre users.
  const minAmount = expectedAmount - AMOUNT_TOLERANCE_FCFA;
  const maxAmount = expectedAmount + AMOUNT_TOLERANCE_FCFA;

  const candidates = transactions.filter(
    (tx) =>
      tx.clientReference === expectedClientReference &&  // ← CRITIQUE
      tx.amount >= minAmount &&
      tx.amount <= maxAmount &&
      tx.timestamp >= since &&
      tx.type === 'in' &&
      !usedExternalRefs.has(tx.id)
  );

  if (candidates.length === 0) {
    // Log pour debug — combien de transactions ont le bon montant mais pas
    // la bonne client_reference (indique tentative d'attaque ou mismatch)
    const amountOnlyMatches = transactions.filter(
      (tx) =>
        tx.amount >= minAmount &&
        tx.amount <= maxAmount &&
        tx.timestamp >= since &&
        tx.type === 'in' &&
        !usedExternalRefs.has(tx.id)
    );
    if (amountOnlyMatches.length > 0) {
      console.warn(
        `[WAVE-BUSINESS] ${amountOnlyMatches.length} tx match le montant ` +
        `${expectedAmount} FCFA mais PAS la client_reference attendue ` +
        `${expectedClientReference}. clientReferences vues: ` +
        amountOnlyMatches.map(t => t.clientReference || '(none)').slice(0, 5).join(', ')
      );
    }
    return null;
  }

  // Si plusieurs candidats (très rare — même clientReference + même montant),
  // prendre le plus récent.
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
