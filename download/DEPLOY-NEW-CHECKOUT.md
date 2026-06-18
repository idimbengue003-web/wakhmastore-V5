# Déploiement de la nouvelle passerelle de paiement (checkout.html)

## Ce qui a changé

### 1. Côté wakhmastore.com (déjà déployé ✅)
- `findMatchingTransaction` accepte maintenant **±10 FCFA de tolérance**
  autour du montant attendu.
- Avant, si la passerelle demandait 1301 FCFA pour un pack à 1300 FCFA
  (variation pour unicité), la transaction Wave n'était jamais matchée
  et le paiement restait en attente pour toujours.
- Maintenant, toute transaction entre 1290 et 1310 FCFA sera matchée.

### 2. Côté passerelle (à déployer toi-même)
Le fichier `checkout.html` a été entièrement refondu :

| Avant | Après |
|-------|-------|
| Fond noir `#020617` avec halos animés verts/or | Fond blanc `#ffffff`, sobre |
| Header en dégradé vert-émeraude | Header plat avec simple titre |
| 4 couleurs (vert + or + bleu Wave + orange OM) | 1 seule couleur accent : **bleu Wave** `#1DC3E0` |
| Bouton Orange Money | **Supprimé** (Wave uniquement) |
| Pastilles emoji partout (🌊 🟠 💎 🛒) | Un seul emoji (icône plan) + SVG check pour Wave |
| Animations `bgShift`, `successPulse`, etc. | Aucune animation (sauf spinner d'attente) |
| L'utilisateur restait bloqué si SMS non détecté | **Fallback** : après 5 min, redirection auto vers wakhmastore.com pour validation serveur |
| Pas de reprise après retour de l'app Wave | localStorage pour reprendre la transaction |

## Comment déployer le nouveau `checkout.html`

Le projet de la passerelle est sur un repo Vercel séparé
(`payment-gateway-beige-ten.vercel.app`). Tu dois déployer ce fichier
dans CE repo, pas dans wakhmastore-V5.

### Méthode 1 : Via l'interface Vercel (le plus simple)

1. Va sur https://vercel.com/dashboard
2. Clique sur le projet `payment-gateway-beige-ten` (ou le nom exact)
3. Va dans l'onglet **Storage** ou **Files** (selon la version Vercel)
4. Ou bien : ouvre le repo GitHub lié à ce projet Vercel
5. Remplace le fichier `checkout.html` à la racine par le nouveau
   fichier : `/home/z/my-project/download/checkout.html`
6. Commit + push → Vercel redéploie automatiquement

### Méthode 2 : Via GitHub

1. Va sur le repo GitHub de la passerelle (cherche dans tes repos
   GitHub le projet qui s'appelle `payment-gateway` ou similaire)
2. Ouvre le fichier `checkout.html` à la racine
3. Clique sur l'icône ✏️ (Edit)
4. Supprime tout le contenu
5. Colle le contenu de `/home/z/my-project/download/checkout.html`
6. Commit directement sur `main`
7. Vercel redéploie dans ~30s

### Méthode 3 : En ligne de commande (si tu as cloné le repo)

```bash
# Sur ta machine locale
git clone https://github.com/<ton-user>/payment-gateway.git
cd payment-gateway

# Remplacer checkout.html par le nouveau
cp /chemin/vers/nouveau/checkout.html ./checkout.html

git add checkout.html
git commit -m "redesign: checkout minimaliste (blanc + bleu Wave) + fallback redirect"
git push origin main
```

## Vérification après déploiement

1. Va sur https://www.wakhmastore.com/acheter-points
2. Clique sur "Acheter" pour le pack Starter (1300 FCFA)
3. Clique sur "Payer maintenant"
4. Tu dois voir la **nouvelle** page : fond blanc, en-tête plat "Wakhma Store", montant en grand, bloc vendeur sobre, bouton bleu Wave "Payer avec Wave", instructions en 4 étapes simples
5. Paie 1300 FCFA via Wave
6. Tu dois être redirigé vers https://www.wakhmastore.com/paiement/confirmation?pending=...&txn=...&status=succes&montant=...
7. La page de confirmation wakhmastore.com doit afficher "Paiement confirmé" avec tes points crédités

## Si la validation auto ne se déclenche toujours pas

Même avec la nouvelle UI et la tolérance ±10 FCFA, si le SMS n'est pas
capté par Automate/MacroDroid, le fallback prend le relais :

- Après **5 minutes** d'attente sur la passerelle, l'utilisateur est
  redirigé vers wakhmastore.com/paiement/confirmation?pending=<id>
- La page de confirmation interroge `/api/payment-status` toutes les 3s
- Cet endpoint interroge Wave Business (API GraphQL) toutes les 30s
- Dès qu'une transaction entrante de ±10 FCFA du montant attendu est
  trouvée, les points sont crédités automatiquement

Donc même dans le pire cas (SMS raté), le paiement finit par être
validé par le polling serveur.
