import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abonnements — Diambar & VIP King',
  description: 'Choisissez votre abonnement Wakhma Store. Plan Diambar à 2 000 FCFA/mois ou VIP King à 5 000 FCFA/mois. Plus d\'annonces, moins de points par débloquage.',
  alternates: { canonical: '/abonnements' },
  openGraph: {
    title: 'Abonnements Wakhma Store — Diambar & VIP King',
    description: 'Découvrez nos abonnements pour vendeurs. Plus d\'annonces, moins de points par débloquage.',
  },
};

export default function AbonnementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
