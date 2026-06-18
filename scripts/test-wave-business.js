// Test direct de l'API Wave Business avec les vraies credentials
// pour voir ce qui se passe

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
            ... on MerchantSweepReceivedEntry {
              sweepGrossVolume
              businessSurrogate {
                name
                employeeIdNumber
                id
              }
              sendingMerchantName
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
        id
      }
      id
    }
    id
  }
}
`;

const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);

const formatDate = (d) => d.toISOString().split('T')[0];

const variables = {
  start: formatDate(weekAgo),
  end: formatDate(today),
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

console.log('=== Test API Wave Business ===');
console.log('URL:', WAVE_GRAPHQL_URL);
console.log('Wallet:', WALLET_ID);
console.log('Periode:', variables.start, '->', variables.end);
console.log('Basic Auth:', basicAuth.substring(0, 30) + '...');
console.log('');

async function test() {
  try {
    const start = Date.now();
    const response = await fetch(WAVE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
        Origin: 'https://business.wave.com',
        Referer: 'https://business.wave.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      body: JSON.stringify({ query: HISTORY_QUERY, variables }),
    });
    const elapsed = Date.now() - start;

    console.log(`Status HTTP: ${response.status} (${elapsed}ms)`);
    console.log('');

    const text = await response.text();
    console.log('Body brut (premiers 3000 chars):');
    console.log(text.substring(0, 3000));
    console.log('');
    console.log('--- Total longueur body:', text.length, 'chars ---');

    try {
      const data = JSON.parse(text);
      if (data.errors) {
        console.log('');
        console.log('ERREURS GraphQL:');
        console.log(JSON.stringify(data.errors, null, 2));
      }
      if (data.data) {
        const entries = data.data?.me?.businessUser?.business?.walletHistory?.historyEntries || [];
        console.log('');
        console.log(`${entries.length} transactions trouvees`);
        if (entries.length > 0) {
          console.log('');
          console.log('Toutes les transactions:');
          entries.forEach((e, i) => {
            console.log(`  [${i}] type=${e.__typename} amount=${e.amount || e.grossAmount} when=${e.whenEntered} summary=${(e.summary || '').substring(0, 80)}`);
          });
        }
      }
    } catch (e) {
      console.log('Body n\'est pas du JSON valide');
    }
  } catch (err) {
    console.log('Erreur fetch:', err.message);
  }
}

test();
