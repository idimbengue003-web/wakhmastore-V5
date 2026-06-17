#!/bin/bash
# ====================================================================
# Script de déploiement : remplacement du paiement WhatsApp
# par la passerelle de paiement (Wave / Orange Money)
# ====================================================================
# Utilisation :
#   1. Créez un Personal Access Token GitHub :
#      https://github.com/settings/tokens/new?scopes=repo
#   2. Lancez ce script :
#      bash deploy-payment-gateway.sh VOTRE_TOKEN_GITHUB
# ====================================================================

set -e

TOKEN="$1"
if [ -z "$TOKEN" ]; then
    echo "❌ Utilisation : bash deploy-payment-gateway.sh VOTRE_TOKEN_GITHUB"
    echo ""
    echo "Créez un token ici : https://github.com/settings/tokens/new?scopes=repo"
    exit 1
fi

cd /home/z/my-project

echo "🚀 Configuration du remote avec le token..."
git remote set-url origin "https://idimbengue003-web:${TOKEN}@github.com/idimbengue003-web/wakhmastore-V5.git"

echo "📦 Vérification de l'état..."
git status
echo ""
echo "📝 Dernier commit local :"
git log --oneline -3
echo ""

echo "⬆️  Push vers GitHub..."
git push origin main

echo ""
echo "✅ Push réussi !"
echo "🔗 Vercel va automatiquement redéployer le site."
echo "   Suivi : https://vercel.com/idimbengue003-webs-projects/wakhmastore-v5"
echo ""
echo "⏳ Attendez 2-3 minutes puis vérifiez :"
echo "   - https://www.wakhmastore.com/recharge"
echo "   - https://www.wakhmastore.com/abonnements"
echo "   - https://www.wakhmastore.com/acheter-points"
echo ""
echo "Vous devriez voir le bouton 'Payer maintenant' au lieu de 'Envoyer la preuve via WhatsApp'."
