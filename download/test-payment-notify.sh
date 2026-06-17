#!/bin/bash
# ============================================================================
# Test du backend /api/payment-notify
# ============================================================================
# Ce script teste si l'endpoint /api/payment-notify fonctionne correctement.
# Il simule ce qu'Automate enverrait quand un paiement Wave est intercepté.
#
# Usage :
#   ./test-payment-notify.sh <TOKEN>
#
# Où <TOKEN> est la valeur de PAYMENT_AUTOMATE_TOKEN dans Vercel.
# ============================================================================

set -e

TOKEN="${1:-}"
PROD_URL="https://www.wakhmastore.com"

if [ -z "$TOKEN" ]; then
  echo "❌ Usage: $0 <TOKEN>"
  echo "   TOKEN = valeur de PAYMENT_AUTOMATE_TOKEN dans Vercel"
  echo ""
  echo "   Exemple: $0 wakhma_8f3k2j9s4m7p1q6r8t5v2x9z3a6b4c7d1e8f3g2h5i7j9k1l4m6n8p0q3r2s5t7v9w1x3"
  exit 1
fi

echo "🧪 Test du backend /api/payment-notify"
echo "====================================="
echo ""
echo "1️⃣  Test GET (health check) — doit retourner 200 + pending_count:"
echo "-------------------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "${PROD_URL}/api/payment-notify?token=${TOKEN}" | head -20
echo ""

echo ""
echo "2️⃣  Test avec token invalide — doit retourner 401:"
echo "-------------------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "${PROD_URL}/api/payment-notify?token=INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"montant": 2000, "source": "test"}'
echo ""

echo ""
echo "3️⃣  Test sans pending — doit retourner 404 (aucun paiement en attente):"
echo "-------------------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "${PROD_URL}/api/payment-notify?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 99999,
    "sender_phone": "761234567",
    "ref": "TEST-NO-PENDING",
    "source": "test_script",
    "raw_text": "Test sans pending"
  }'
echo ""

echo ""
echo "4️⃣  Test avec montant invalide — doit retourner 400:"
echo "-------------------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "${PROD_URL}/api/payment-notify?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"montant": "abc", "source": "test"}'
echo ""

echo ""
echo "====================================="
echo "✅ Tests terminés. Vérifie les codes HTTP ci-dessus :"
echo "   - 200 = OK"
echo "   - 400 = Requête invalide (montant manquant, etc.)"
echo "   - 401 = Token invalide"
echo "   - 404 = Aucun pending (normal si pas de paiement en cours)"
echo "   - 500 = Erreur serveur (vérifie les logs Vercel)"
