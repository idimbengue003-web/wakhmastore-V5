import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acheter des points — Débloquez les contacts',
  description: 'Rechargez votre compte en points sur Wakhma Store. Paiement par Wave, Orange Money ou virement bancaire. Débloquez les coordonnées des chercheurs.',
  alternates: { canonical: '/acheter-points' },
  openGraph: {
    title: 'Acheter des points — Wakhma Store',
    description: 'Rechargez vos points et débloquez les contacts des chercheurs sur Wakhma Store.',
  },
};

export default function AcheterPointsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
