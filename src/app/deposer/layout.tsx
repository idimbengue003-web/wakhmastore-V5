import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Déposer une annonce — Gratuit',
  description: 'Publiez gratuitement votre annonce sur Wakhma Store. Décrivez ce que vous cherchez et recevez des offres des vendeurs de Dakar en quelques minutes.',
  alternates: { canonical: '/deposer' },
  openGraph: {
    title: 'Déposer une annonce gratuite — Wakhma Store',
    description: 'Postez votre besoin gratuitement sur Wakhma Store et laissez les vendeurs de Dakar vous trouver.',
  },
};

export default function DeposerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
