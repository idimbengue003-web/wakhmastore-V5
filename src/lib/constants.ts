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
export const POINT_PACKAGES = [
  {
    id: 'starter',
    points: 7000,
    price: 1300,
    label: 'Starter',
    popular: false,
  },
  {
    id: 'pro',
    points: 17000,
    price: 2500,
    label: 'Pro',
    popular: true,
  },
  {
    id: 'business',
    points: 29000,
    price: 5000,
    label: 'Business',
    popular: false,
  },
] as const;

// --- Unlock contact cost ---
export const POINTS_TO_UNLOCK = 1500;

// --- Referral ---
export const POINTS_PER_REFERRAL = 400;
export const MAX_REFERRAL_POINTS = 30000;
