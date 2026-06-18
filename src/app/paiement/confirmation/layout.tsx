import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmation de paiement — Wakhma Store',
  description: 'Statut de votre paiement Wave sur Wakhma Store.',
  robots: { index: false, follow: false },
};

export default function PaiementConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
