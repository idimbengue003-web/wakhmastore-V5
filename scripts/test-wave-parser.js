// Test complet : on rejoue l'appel Wave Business avec le nouveau parser
// et on vérifie qu'on détecte bien la transaction 1300 FCFA de 18:55

const API_KEY = 'US_tok_sn_03b36f96c9e448ae6cdad4fa9bcf74d1';
const WALLET_ID = 'W_sn_LUvGY4hJVmNP';
const WAVE_GRAPHQL_URL = 'https://sn.mmapp.wave.com/a/business_graphql';

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
    businessUser {
      business {
        walletHistory(start: $start, end: $end, walletOpaqueId: $walletOpaqueId, limit: $limit, transactionId: $transactionId, customerMobileStr: $customerMobileStr, surrogateEmployeeId: $surrogateEmployeeId, searchTerm: $searchTerm, includePending: $includePending, transactionType: $transactionType) {
          historyEntries {
            __typename
            id
            summary
            whenEntered
            amount
            isPending
            isCancelled
            ... on MerchantSaleEntry {
              isRefunded
              transferId
              customerMobile: unmaskedSenderMobile
              grossAmount
              feeAmount
            }
            ... on MerchantSweepReceivedEntry {
              sweepGrossVolume
            }
            ... on RemittanceTransferReceivedEntry {
              opaqueId
              isReversed
              externalReference
            }
            ... on UserLinkedAccountTransferW2BEntry {
              liaTransferId
            }
          }
        }
      }
    }
  }
}
`;

// ── Le nouveau parser (identique à src/lib/wave-business.ts) ──
function parseAmount(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const str = String(value).trim();
  if (!str) return 0;
  const cleaned = str
    .replace(/CFA/gi, '').replace(/FCFA/gi, '').replace(/XOF/gi, '')
    .replace(/F\b/g, '').replace(/\s+/g, '')
    .replace(/[.,](?=\d{3}\b)/g, '')
    .replace(/[.,](?=\d{3}(?!\d))/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

const INCOMING_TYPES = new Set([
  'MerchantSaleEntry', 'RemittanceTransferReceivedEntry',
  'MerchantSweepReceivedEntry', 'UserLinkedAccountTransferW2BEntry',
]);

function parseWaveResponse(data) {
  const walletHistory = data?.data?.me?.businessUser?.business?.walletHistory;
  if (!walletHistory) return [];
  const entries = walletHistory.historyEntries;
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry) return null;
      const typename = String(entry.__typename || '');
      if (!INCOMING_TYPES.has(typename)) return null;
      if (entry.isCancelled === true) return null;
      if (entry.isPending === true) return null;
      const amount = parseAmount(entry.grossAmount ?? entry.amount);
      if (!amount || amount <= 0) return null;
      const id = String(entry.transferId || entry.id || entry.opaqueId || '');
      if (!id) return null;
      const senderPhone = entry.customerMobile || entry.senderMobile || '';
      const timestampRaw = entry.whenEntered || entry.whenCreated;
      const timestamp = timestampRaw ? new Date(timestampRaw) : new Date();
      if (isNaN(timestamp.getTime())) return null;
      return { id, amount, senderPhone: String(senderPhone), timestamp, type: 'in' };
    })
    .filter((tx) => tx !== null);
}

// ── Appel API + parse ──
const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);
const fmt = (d) => d.toISOString().split('T')[0];

const variables = {
  start: fmt(weekAgo),
  end: fmt(today),
  walletOpaqueId: WALLET_ID,
  limit: 100,
  transactionId: null,
  customerMobileStr: null,
  searchTerm: null,
  surrogateEmployeeId: null,
  includePending: false,
  transactionType: 'ALL',
};

const basicAuth = Buffer.from(`:${API_KEY}`).toString('base64');

async function test() {
  console.log('=== Test du nouveau parser ===\n');
  const response = await fetch(WAVE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
      Origin: 'https://business.wave.com',
      Referer: 'https://business.wave.com/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/149.0.0.0 Mobile Safari/537.36',
    },
    body: JSON.stringify({ query: HISTORY_QUERY, variables }),
  });

  console.log(`HTTP ${response.status}\n`);
  const data = await response.json();

  if (data.errors) {
    console.log('ERREURS GraphQL:', JSON.stringify(data.errors, null, 2));
    return;
  }

  const transactions = parseWaveResponse(data);
  console.log(`✅ ${transactions.length} transactions entrantes parsées\n`);
  console.log('Liste:');
  transactions.forEach((tx, i) => {
    console.log(`  [${i}] amount=${tx.amount} FCFA  from=${tx.senderPhone}  when=${tx.timestamp.toISOString()}  id=${tx.id}`);
  });

  // Test : simuler un pending payment de 1300 FCFA créé à 18:54 aujourd'hui
  console.log('\n=== Simulation match pour pending 1300 FCFA ===');
  const pendingCreatedAt = new Date('2026-06-18T18:54:00Z');
  const usedRefs = new Set(); // aucune transaction déjà utilisée
  const match = transactions.find(
    (tx) =>
      tx.amount === 1300 &&
      tx.timestamp >= pendingCreatedAt &&
      tx.type === 'in' &&
      !usedRefs.has(tx.id)
  );
  if (match) {
    console.log('✅ MATCH TROUVÉ !');
    console.log(`   Transaction: ${match.id} — ${match.amount} FCFA — from ${match.senderPhone}`);
    console.log(`   À ${match.timestamp.toISOString()}`);
    console.log('   → Le système créditerait 7000 points automatiquement.');
  } else {
    console.log('❌ Pas de match. Soit le paiement n\'est pas encore visible, soit le filtre est trop strict.');
  }
}

test().catch((e) => console.log('Erreur:', e.message));
