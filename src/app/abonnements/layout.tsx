import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abonnements — BOLT ⚡ Diambar, Diambar & VIP King',
  description: 'Choisissez votre abonnement Wakhma Store. BOLT ⚡ Diambar à 2 000 FCFA/mois, Diambar à 5 000 FCFA/mois ou VIP King à 9 900 FCFA/mois. Plus d\'annonces, moins de points par débloquage.',
  alternates: { canonical: '/abonnements' },
  openGraph: {
    title: 'Abonnements Wakhma Store — BOLT ⚡ Diambar, Diambar & VIP King',
    description: 'Découvrez nos abonnements pour vendeurs. Plus d\'annonces, moins de points par débloquage.',
  },
};

export default function AbonnementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
