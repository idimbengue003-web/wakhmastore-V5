import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abonnements — BOLT ⚡, DIAMBAR & VIP King',
  description: 'Choisissez votre abonnement Wakhma Store. BOLT ⚡ à 2 000 FCFA/mois, DIAMBAR à 5 000 FCFA/mois ou VIP King à 9 900 FCFA/mois. Plus d\'annonces, moins de points par débloquage.',
  alternates: { canonical: '/abonnements' },
  openGraph: {
    title: 'Abonnements Wakhma Store — BOLT ⚡, DIAMBAR & VIP King',
    description: 'Découvrez nos abonnements pour vendeurs. Plus d\'annonces, moins de points par débloquage.',
  },
};

export default function AbonnementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
