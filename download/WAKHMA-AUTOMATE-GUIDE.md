# 🤖 Guide d'installation Automate (LlamaLab) — Wakhma Store

Ce guide explique comment configurer **Automate** sur ton téléphone marchand (celui qui reçoit les paiements Wave au **78 927 12 96**) pour créditer automatiquement les points/abonnements de tes clients.

## 📋 Prérequis

1. **Android** 7.0 ou plus récent
2. **Application Wave** installée et connectée sur le téléphone marchand
3. **Application Automate** installée depuis le Play Store :
   👉 https://play.google.com/store/apps/details?id=com.llamalab.automate

---

## 🎯 Architecture en 1 schéma

```
┌─────────────────────────────────────────────────────────────┐
│  Téléphone client                                            │
│  Client paie Wave → 2 000 FCFA                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Téléphone marchand (78 927 12 96)                          │
│  Reçoit :                                                   │
│   • Notification Wave (1-3s)                                │
│   • SMS Wave (5-15s)                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ Automate intercepte (le + rapide gagne)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Automate (Android)                                         │
│  Parse le montant + téléphone client + réf Wave            │
│  HTTP POST → /api/payment-notify?token=XXX                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Serveur wakhmastore.com (Vercel)                           │
│  Match le pending → crédite points/abonnement              │
│  Marque pending comme "completed"                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Page de confirmation du client                             │
│  Polling /api/auth/me → affiche "Paiement confirmé !"      │
│  + "+15 000 points crédités !"                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Étapes d'installation

### Étape 1 — Génère le token secret

Sur **Vercel**, ajoute une variable d'environnement :
- **Nom** : `PAYMENT_AUTOMATE_TOKEN`
- **Valeur** : une chaîne aléatoire de 40+ caractères, par exemple :
  ```
  wakhma_8f3k2j9s4m7p1q6r8t5v2x9z3a6b4c7d1e8f3g2h5i7j9k1l4m6n8p0q3r2s5t7v9w1x3
  ```

👉 Tu peux générer ce token sur : https://www.random.org/strings/?num=1&len=50&digits=on&loweralpha=on&unique=on&format=html&rnd=new

**Note cette valeur** — tu en auras besoin dans Automate.

### Étape 2 — Installe Automate

1. Ouvre le **Play Store** sur le téléphone marchand
2. Cherche **"Automate"** (par LlamaLab)
3. Installe l'app (icône verte avec un engrenage)
4. Ouvre Automate et accepte les permissions

### Étape 3 — Accorde les permissions nécessaires

Automate a besoin de ces permissions :

| Permission | Pourquoi |
|-----------|----------|
| **SMS** | Lire les SMS Wave reçus |
| **Notifications** | Intercepter les notifications de l'app Wave |
| **Internet** | Envoyer le webhook vers wakhmastore.com |
| **Service d'accessibilité** | (optionnel) Lire le contenu des notifications détaillées |
| **Téléphone** | Lire l'état du téléphone (pour éviter de lancer le flux pendant un appel) |
| **Démarrage** | Lancer Automate automatiquement au redémarrage du téléphone |

**Pour accorder les permissions :**
1. Dans Automate, va dans **≡ → Paramètres → Autorisations**
2. Active chaque permission une par une
3. Pour **Notifications** : va dans **Paramètres Android → Applications → Automate → Accès aux notifications** → Active

### Étape 4 — Crée le Flow principal (Trigger notification Wave)

Dans Automate :

1. Appuie sur **+** (nouveau flow) en bas à droite
2. Tu vois une grille vide avec un point de départ **"Flow beginning"**

#### 4.1 Ajoute le Trigger "Notification posted"

1. Appuie sur le **+** en bas
2. Cherche **"Notification posted?"** (icône cloche)
3. Place-le après "Flow beginning"
4. Configure-le :
   - **Application** : `Wave` (com.wave.android)
   - **Categories** : (vide = toutes)
   - **Text contains** : `FCFA` OU `recu` OU `recus` OU `Wave`
   - Coche **"Has text"**

#### 4.2 Ajoute un bloc "Variable set" pour extraire le texte

1. Ajoute un bloc **"Variable set"** (icône =)
2. Place-le après le trigger
3. Configure :
   - **Variable** : `notification_text`
   - **Value** : `{notification_text}` (utilise le sélecteur pour piocher dans les variables du trigger)

#### 4.3 Ajoute un bloc "Text replace" pour nettoyer

1. Ajoute **"Text replace"** (icône T)
2. Configure :
   - **Text** : `{notification_text}`
   - **Pattern** : `[^\d\s,;.:a-zA-ZÀ-ÿ-]`
   - **Replacement** : (vide)
   - **Output** : `clean_text`

#### 4.4 Ajoute "Regex match" pour extraire le montant

1. Ajoute **"Regex match"** (icône R)
2. Configure :
   - **Text** : `{clean_text}`
   - **Pattern** : `(\d[\d\s.]*)\s*FCFA`
   - **Output group 1** : `montant_raw`
3. Ajoute un autre "Text replace" pour nettoyer le montant :
   - **Text** : `{montant_raw}`
   - **Pattern** : `[\s.]`
   - **Replacement** : (vide)
   - **Output** : `montant`

#### 4.5 Ajoute "Regex match" pour extraire le téléphone

1. Ajoute **"Regex match"**
2. Configure :
   - **Text** : `{clean_text}`
   - **Pattern** : `de\s+(\+?\d[\d\s]{6,})`
   - **Output group 1** : `sender_phone_raw`

#### 4.6 Ajoute "Regex match" pour extraire la référence

1. Ajoute **"Regex match"**
2. Configure :
   - **Text** : `{clean_text}`
   - **Pattern** : `(?:Ref|Réf|Reference|Transaction)[:\s#]*([A-Z0-9-]{4,})`
   - **Output group 1** : `ref_wave`

#### 4.7 Ajoute "HTTP request" pour appeler le webhook

1. Ajoute **"HTTP request"** (icône globe)
2. Configure :
   - **Method** : `POST`
   - **URL** : `https://www.wakhmastore.com/api/payment-notify?token=TON_TOKEN_ICI`
     *(remplace TON_TOKEN_ICI par le token de l'étape 1)*
   - **Headers** :
     ```
     Content-Type: application/json
     ```
   - **Body** :
     ```json
     {
       "montant": {montant},
       "sender_phone": "{sender_phone_raw}",
       "ref": "{ref_wave}",
       "source": "wave_notification",
       "raw_text": "{notification_text}"
     }
     ```
   - **Timeout** : 30 secondes
   - **Output** : `http_response`

#### 4.8 (Optionnel) Ajoute "Toast show" pour debug

1. Ajoute **"Toast show"** (icône bulle)
2. Configure :
   - **Message** : `Wakhma: {http_response}`

#### 4.9 Sauvegarde et nomme le flow

1. Appuie sur **💾 Sauvegarder**
2. Nomme-le : `Wakhma - Wave Notif`

---

### Étape 5 — Crée le second Flow (Trigger SMS Wave)

Répète les étapes 4.x avec ces différences :

#### 5.1 Trigger différent

- Type : **"SMS received"** (icône enveloppe)
- **Sender contains** : (vide = tous)
- **Text contains** : `Wave` OU `FCFA` OU `recu`

#### 5.2 Variables du trigger

- Le SMS text est dans `{sms_text}` (au lieu de `{notification_text}`)
- L'expéditeur est dans `{sms_sender}`

#### 5.3 HTTP request - body différent

```json
{
  "montant": {montant},
  "sender_phone": "{sender_phone}",
  "ref": "{ref_wave}",
  "source": "wave_sms",
  "raw_text": "{sms_text}"
}
```

#### 5.4 Nomme le flow

Nomme-le : `Wakhma - SMS Wave`

---

### Étape 6 — Active les flows

1. Dans l'écran d'accueil d'Automate, tu vois tes 2 flows
2. Appuie sur le **bouton play ▶️** à côté de chaque flow
3. Le voyant passe au **vert** = flow actif

### Étape 7 — Active le démarrage automatique

Pour qu'Automate démarre tout seul après un redémarrage du téléphone :

1. Va dans **≡ → Paramètres → Démarrage**
2. Active **"Démarrer Automate au démarrage"**
3. Active **"Démarrer les flows au démarrage"**

### Étape 8 — Test de bout en bout

1. Sur un **autre téléphone** (ou demande à un ami), va sur `wakhmastore.com/recharge`
2. Connecte-toi et clique sur **"Payer maintenant"** pour un petit pack (1 300 FCFA Starter)
3. Paie via Wave
4. Sur le téléphone marchand, vérifie :
   - La notification Wave apparaît
   - Le toast Automate affiche `Wakhma: {"success":true,...}`
5. Sur le téléphone du client, la page de confirmation devrait afficher automatiquement :
   - ✅ **"Paiement confirmé !"**
   - ✅ **"+7 000 points crédités !"**

---

## 🧪 Test du backend (sans Automate)

Tu peux tester si le backend fonctionne en envoyant manuellement un webhook avec `curl` :

```bash
# Test avec un token valide
curl -X POST "https://www.wakhmastore.com/api/payment-notify?token=TON_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 2000,
    "sender_phone": "761234567",
    "ref": "WV-TEST123",
    "source": "manual_test",
    "raw_text": "Vous avez recu 2000 FCFA de 761234567. Solde: 50000 FCFA. Ref: WV-TEST123"
  }'
```

**Réponse attendue** (si un pending existe pour 2000 FCFA) :
```json
{
  "success": true,
  "message": "Paiement traité avec succès",
  "pendingId": "clxxx...",
  "userId": "clxxx...",
  "phone": "761234567",
  "montant": 2000,
  "planId": "gratuit",
  "purchaseType": "abonnement",
  "points_credited": 15000,
  "matched_by": "phone",
  "source": "manual_test",
  "confirmed_at": "2025-06-17T..."
}
```

**Réponse si aucun pending** :
```json
{
  "success": false,
  "error": "Aucun paiement en attente pour ce montant",
  "montant": 2000,
  "searched_minutes": 30
}
```

---

## 🔧 Dépannage

### Problème : Automate ne déclenche pas le flow

**Solutions :**
1. Vérifie que les permissions **Notifications** et **SMS** sont accordées
2. Vérifie que le téléphone n'est pas en **mode Ne pas déranger**
3. Dans Android : **Paramètres → Applications → Automate → Battery → Non optimisé**
4. Redémarre Automate après chaque changement de permission

### Problème : Le webhook renvoie 401 (token invalide)

**Solutions :**
1. Vérifie que `PAYMENT_AUTOMATE_TOKEN` est bien défini dans Vercel
2. Vérifie que tu utilises le même token dans Automate
3. Redéploie sur Vercel si tu viens d'ajouter la variable

### Problème : Le webhook renvoie 404 (aucun pending)

**Causes possibles :**
1. Le client a payé sans passer par le site (Wave direct → pas de pending)
2. Le pending a expiré (> 30 minutes)
3. Le montant ne correspond pas à un plan (montant custom)

**Solution :** Demande au client de passer par `wakhmastore.com/recharge` la prochaine fois

### Problème : Le client voit "Crédit en cours de synchronisation..." indéfiniment

**Causes :**
1. Automate n'a pas intercepté le paiement (voir problème 1)
2. Le webhook a échoué (vérifie les logs Vercel)
3. Le matching a échoué (montant incorrect)

**Solution manuelle :** Crédite manuellement les points via le panneau admin ou demande au client de rafraîchir la page après 1 minute

### Problème : Deux clients paient le même montant en même temps

**Comportement :** Le système prend le plus ancien pending (FIFO). Si tu as beaucoup de volume, ajoute le téléphone du client dans Automate pour matcher plus précisément.

---

## 📊 Logs et monitoring

### Sur Vercel

Va dans **Vercel Dashboard → wakhmastore-V5 → Logs** et cherche :
- `[PAYMENT-PENDING]` — quand un client clique "Payer"
- `[PAYMENT-NOTIFY]` — quand Automate envoie un webhook
- `[PAYMENT-CALLBACK]` — quand l'ancien gateway appelle (backward compat)

### Sur Automate

Dans Automate, va dans **≡ → Logs** pour voir l'historique des flows exécutés.

---

## 🔒 Sécurité

- ✅ Le token est stocké dans Vercel env vars (pas dans le code)
- ✅ Le token dans Automate est local au téléphone marchand
- ✅ Le webhook rejette tout appel sans token valide
- ✅ Les transactions déjà traitées ne sont pas re-créditées (idempotence)
- ✅ Les pendings expirent après 30 minutes (anti-accumulation)

---

## ✅ Checklist finale

- [ ] Token `PAYMENT_AUTOMATE_TOKEN` défini sur Vercel
- [ ] App Automate installée sur le téléphone marchand
- [ ] Permissions Notifications + SMS + Internet accordées
- [ ] Flow "Wakhma - Wave Notif" créé et activé
- [ ] Flow "Wakhma - SMS Wave" créé et activé
- [ ] Démarrage automatique activé
- [ ] Test avec un petit paiement (1 300 FCFA) réussi
- [ ] Téléphone marchand toujours allumé et connecté à Internet

---

## 📞 Support

Si tu rencontres un problème :
1. Vérifie les logs Vercel : https://vercel.com/idimbengue003-web/wakhmastore-V5/logs
2. Vérifie les logs Automate sur le téléphone
3. Teste le backend avec `curl` (section "Test du backend" ci-dessus)

---

**Une fois configuré, le système fonctionne 24/7 sans intervention.** Tes clients paient sur Wave, reçoivent leurs points/abonnement en quelques secondes, et voient la confirmation sur leur écran automatiquement. 🎉
