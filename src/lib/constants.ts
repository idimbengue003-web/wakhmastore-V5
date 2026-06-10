// ============ WAKHMA STORE — SHARED CONSTANTS ============

// --- Plans (for sellers) ---
export const PLANS = {
  gratuit: {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    period: '/mois',
    description: 'Pour découvrir Wakhma Store',
    color: 'gray',
    annoncesPerMonth: 3, // max "Je vends" annonces per month
    annoncesPerWeek: 0,
    points: 0,
    badge: null,
    features: [
      '3 annonces "Je cherche" par mois',
      'Visibilité standard',
      'Support par email',
    ],
  },
  diambar: {
    id: 'diambar',
    name: 'Diambâr',
    price: 5000,
    period: '/mois',
    description: 'Pour les vendeurs actifs',
    color: 'blue',
    annoncesPerMonth: 5, // 5 "Je vends" annonces per month
    annoncesPerWeek: 0,
    points: 26000,
    badge: '⭐ Diambâr',
    features: [
      '5 annonces "Je vends" par mois',
      '26 000 points offerts',
      'Badge ⭐ Diambâr',
      'Annonces spéciales & mises en avant',
      'Faveurs & priorité dans les résultats',
      'Support prioritaire WhatsApp',
    ],
  },
  vip_king: {
    id: 'vip_king',
    name: 'VIP KING',
    price: 9900,
    period: '/mois',
    description: 'Pour les pros de la vente',
    color: 'orange',
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
