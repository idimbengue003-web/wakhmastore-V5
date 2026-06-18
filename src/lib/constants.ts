// ============ WAKHMA STORE — SHARED CONSTANTS ============

// --- Plans ---
export const PLANS = {
  none: {
    id: 'none',
    name: 'Sans abonnement',
    price: 0,
    period: '',
    description: 'Postez vos demandes gratuitement',
    color: 'gray',
    annoncesPerMonth: 0, // unlimited "Je cherche", 0 "Je vends"
    annoncesPerWeek: 0,
    points: 0,
    badge: null,
    features: [
      'Annonces "Je cherche" gratuites & illimitées',
      'Les vendeurs paient pour voir votre numéro',
    ],
  },
  gratuit: {
    id: 'gratuit',
    name: 'BOLT ⚡',
    price: 2000,
    period: '/mois',
    description: 'Pour commencer à vendre sur Wakhma',
    color: 'blue',
    annoncesPerMonth: 3, // max "Je vends" annonces per month
    annoncesPerWeek: 0,
    points: 15000,
    badge: '⚡ DIAMBAR',
    features: [
      '15 000 points offerts',
      '3 annonces "Je vends" par mois',
      'Badge ⚡ DIAMBAR',
      'Visibilité standard',
      'Support par email',
    ],
  },
  diambar: {
    id: 'diambar',
    name: 'DIAMBAR 💪🏽',
    price: 5000,
    period: '/mois',
    description: 'Pour les vendeurs actifs',
    color: 'green',
    annoncesPerMonth: 5, // 5 "Je vends" annonces per month
    annoncesPerWeek: 0,
    points: 26000,
    badge: '💪🏽 DIAMBAR',
    features: [
      '5 annonces "Je vends" par mois',
      '26 000 points offerts',
      'Badge 💪🏽 DIAMBAR',
      'Annonces spéciales & mises en avant',
      'Faveurs & priorité dans les résultats',
      'Support prioritaire WhatsApp',
    ],
  },
  vip_king: {
    id: 'vip_king',
    name: 'VIP KING 👑',
    price: 9900,
    period: '/mois',
    description: 'Pour les pros de la vente',
    color: 'gold',
    annoncesPerMonth: 0, // unlimited (per week instead)
    annoncesPerWeek: 5, // 5 "Je vends" annonces per week
    points: 49000,
    badge: '👑 VIP KING',
    features: [
      '5 annonces "Je vends" par semaine',
      '49 000 points offerts',
      'Badge 👑 VIP KING',
      'Annonces en tête de liste',
      'Annonces spéciales & mises en avant',
      'Faveurs & visibilité maximale',
      'Statistiques détaillées',
      'Mise en avant hebdomadaire',
      'Support prioritaire WhatsApp',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// --- Point Packages (purchase with FCFA) ---
// ⚠️ SOURCE UNIQUE DE VÉRITÉ — utilisée par :
//   - /api/payment-pending (validation planId + montant)
//   - /api/payment-status  (crédit des points après confirmation Wave)
//   - /api/payment-notify  (match SMS callback)
//   - /recharge             (onglet "Acheter des Points")
//   - /acheter-points       (page d'achat dédiée)
// Toute modification ici se propage partout. NE PAS redéfinir POINT_PACKAGES
// localement dans une page — ça désynchroniserait le frontend du backend.
export const POINT_PACKAGES = [
  {
    id: 'starter',
    points: 7000,
    price: 1300,
    label: 'Starter',
    popular: false,
  },
  {
    id: 'standard',
    points: 17000,
    price: 2500,
    label: 'Standard',
    popular: true,
  },
  {
    id: 'premium',
    points: 50000,
    price: 5000,
    label: 'Premium',
    popular: false,
  },
  {
    id: 'ultimate',
    points: 105000,
    price: 10000,
    label: 'Ultimate',
    popular: false,
  },
] as const;

// --- Unlock contact cost ---
export const POINTS_TO_UNLOCK = 1500;

// --- Referral ---
export const POINTS_PER_REFERRAL = 400;
export const MAX_REFERRAL_POINTS = 30000;

// --- Categories (single source of truth) ---
export const CATEGORIES = [
  { name: 'Téléphones', emoji: '📱' },
  { name: 'TV & Écrans', emoji: '📺' },
  { name: 'Frigo & Congélateur', emoji: '🧊' },
  { name: 'Climatiseur & Ventilateur', emoji: '❄️' },
  { name: 'Ordinateurs', emoji: '💻' },
  { name: 'Tablettes', emoji: '📲' },
  { name: 'Audio & Son', emoji: '🔊' },
  { name: 'Électroménager', emoji: '🏠' },
  { name: 'Plomberie', emoji: '🔧' },
  { name: 'Électricité', emoji: '⚡' },
  { name: 'Meubles', emoji: '🛋️' },
  { name: 'Mode & Vetements', emoji: '👗' },
  { name: 'Cosmétiques', emoji: '💄' },
  { name: 'Alimentation', emoji: '🍜' },
  { name: 'Roblox', emoji: '🎮' },
  { name: 'Brawl Stars', emoji: '⭐' },
  { name: 'eFootball', emoji: '⚽' },
  { name: 'Autres Jeux', emoji: '🕹️' },
  { name: 'Services', emoji: '🤝' },
  { name: 'Moto', emoji: '🏍️' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Immobilier', emoji: '🏗️' },
  { name: 'Autre', emoji: '📦' },
] as const;

// Category emoji lookup map
export const CATEGORY_EMOJIS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.emoji])
);

// Quick categories shown in hero
export const QUICK_CATEGORIES = ['Téléphones', 'TV & Écrans', 'Ordinateurs', 'Meubles', 'Moto', 'Immobilier'];

// --- Payment info (env vars with fallbacks) ---
export const PAYMENT_PHONE = process.env.NEXT_PUBLIC_PAYMENT_PHONE || '78 927 12 96';
export const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/221789271296';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '221789271296';

// ── URL de paiement Wave Business (checkout avec montant pré-rempli) ───────
// Format attendu (sans query string) :
//   https://pay.wave.com/m/<merchant-slug>/pay/
//
// On y ajoute ensuite ?amount=<montant>&currency=XOF&client_reference=<pendingId>
//
// ⚠️ Cette URL est OBLIGATOIRE pour le bouton "Payer avec Wave". Sans elle,
// le bouton affiche un message d'erreur à la place.
//
// Pour la trouver :
// 1. Connecte-toi sur https://business.wave.com
// 2. Va dans "Liens de paiement" ou "Payment Links"
// 3. Crée un lien → copie l'URL (ex: https://pay.wave.com/m/wakhma-store/pay/)
// 4. Mets NEXT_PUBLIC_WAVE_CHECKOUT_URL dans Vercel avec cette valeur
export const WAVE_CHECKOUT_URL = process.env.NEXT_PUBLIC_WAVE_CHECKOUT_URL || '';

/**
 * Construit l'URL de paiement Wave Business avec montant pré-rempli.
 * L'utilisateur sera redirigé vers cette URL ; Wave ouvrira la page de
 * paiement avec le montant déjà saisi — il n'aura plus qu'à confirmer.
 *
 * @param amount  Montant en FCFA (ex: 1300)
 * @param pendingId  Référence unique (servira de client_reference côté Wave)
 * @returns URL complète vers la page de paiement Wave, ou '' si non configuré
 */
export function buildWaveCheckoutUrl(amount: number, pendingId: string): string {
  if (!WAVE_CHECKOUT_URL) return '';
  const base = WAVE_CHECKOUT_URL.endsWith('?')
    ? WAVE_CHECKOUT_URL.slice(0, -1)
    : WAVE_CHECKOUT_URL;
  const separator = base.includes('?') ? '&' : '?';
  const params = new URLSearchParams({
    amount: String(amount),
    currency: 'XOF',
    client_reference: pendingId,
  });
  return `${base}${separator}${params.toString()}`;
}

// --- Automated payment gateway links ---
export const PAYMENT_GATEWAY_BASE = 'https://payment-gateway-beige-ten.vercel.app/checkout.html';

// Production URL where users are redirected after payment confirmation.
// The gateway appends ?txn=...&status=succes&montant=...&compte=...&plan=...&points=...
const PAYMENT_RETURN_URL = encodeURIComponent('https://www.wakhmastore.com/paiement/confirmation');

function buildGatewayUrl(planSlug: string): string {
  return `${PAYMENT_GATEWAY_BASE}?plan=${planSlug}&callback_url=${PAYMENT_RETURN_URL}`;
}

export const SUBSCRIPTION_PAYMENT_LINKS: Record<string, string> = {
  gratuit: buildGatewayUrl('bolt'),
  diambar: buildGatewayUrl('diambar'),
  vip_king: buildGatewayUrl('vip-king'),
};

export const POINTS_PAYMENT_LINKS: Record<string, string> = {
  starter: buildGatewayUrl('points-7000'),
  standard: buildGatewayUrl('points-17000'),
  premium: buildGatewayUrl('points-50000'),
  ultimate: buildGatewayUrl('points-105000'),
};

// Helper to get subscription payment URL by plan id
export function getSubscriptionPaymentUrl(planId: string): string {
  return SUBSCRIPTION_PAYMENT_LINKS[planId] || PAYMENT_GATEWAY_BASE;
}

// Helper to get points payment URL by package id
export function getPointsPaymentUrl(packageId: string): string {
  return POINTS_PAYMENT_LINKS[packageId] || PAYMENT_GATEWAY_BASE;
}

// --- Helper: Is user a subscriber? ---
export function isSubscriber(plan: string): boolean {
  return plan === 'gratuit' || plan === 'diambar' || plan === 'vip_king';
}

// --- Helper: Is user VIP? ---
export function isVip(plan: string): boolean {
  return plan === 'diambar' || plan === 'vip_king';
}

// --- Helper: Format price ---
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

// --- Helper: Time ago ---
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString('fr-FR');
}

// --- Helper: Plan label ---
export function getPlanLabel(plan: string): string {
  if (plan === 'vip_king') return 'VIP KING 👑';
  if (plan === 'diambar') return 'DIAMBAR 💪🏽';
  if (plan === 'gratuit') return 'BOLT ⚡';
  return 'Sans abonnement';
}
