# Déploiement : Remplacement du paiement WhatsApp par la passerelle de paiement

## Problème
Le site production (wakhmastore.com) affiche toujours le paiement WhatsApp car les
changements locaux n'ont pas été poussés sur GitHub. Voici 2 méthodes pour déployer.

## Méthode 1 : Appliquer le patch (recommandé si vous avez déjà cloné le repo)

```bash
# Sur votre machine locale, dans le clone du repo wakhmastore-V5 :
git fetch origin
git checkout main
git pull origin main

# Appliquer le patch
git apply payment-gateway-replace-whatsapp.patch

# Vérifier les changements
git diff --stat

# Committer et pousser
git add -A
git commit -m "feat: remplacer le paiement WhatsApp par la passerelle de paiement"
git push origin main
```

Vercel déploiera automatiquement après le push.

## Méthode 2 : Utiliser un token GitHub (depuis ce conteneur)

```bash
# 1. Créer un Personal Access Token sur GitHub :
#    https://github.com/settings/tokens/new?scopes=repo

# 2. Configurer le remote avec le token :
cd /home/z/my-project
git remote set-url origin https://idimbengue003-web:VOTRE_TOKEN@github.com/idimbengue003-web/wakhmastore-V5.git

# 3. Pousser :
git push origin main
```

## Méthode 3 : Copier les fichiers manuellement

Copiez ces 8 fichiers vers votre repo GitHub, commitez et poussez :

1. `src/lib/constants.ts` — ajoute PAYMENT_GATEWAY_BASE, SUBSCRIPTION_PAYMENT_LINKS, POINTS_PAYMENT_LINKS, getSubscriptionPaymentUrl, getPointsPaymentUrl
2. `src/app/recharge/page.tsx` — bouton "Payer maintenant" redirige vers la passerelle
3. `src/app/abonnements/page.tsx` — idem pour les abonnements
4. `src/app/acheter-points/page.tsx` — idem pour les packs de points
5. `src/app/api/subscribe/route.ts` — message simplifié
6. `src/app/api/subscriptions/route.ts` — message simplifié
7. `src/app/api/points/route.ts` — message simplifié
8. `src/app/api/purchase-points/route.ts` — message simplifié

## Changements effectués

- Le bloc "Envoyer la preuve via WhatsApp" a été remplacé par un bouton "Payer maintenant"
- Le bouton redirige vers https://payment-gateway-beige-ten.vercel.app/checkout.html
- Les API ne demandent plus d'envoyer une capture sur WhatsApp
- Le callback `/api/payment-callback` (déjà en production) crédite automatiquement les points/abonnements après confirmation du paiement

## Après déploiement

- Vérifiez sur https://www.wakhmastore.com/recharge — vous devriez voir "Payer maintenant" au lieu de "Envoyer la preuve via WhatsApp"
- Vérifiez sur https://www.wakhmastore.com/abonnements — idem
- Vérifiez sur https://www.wakhmastore.com/acheter-points — idem
