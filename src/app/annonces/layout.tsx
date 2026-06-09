import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annonces — Trouvez ce que vous cherchez',
  description: 'Parcourez les annonces de Wakhma Store. Téléphones, TV, électroménager, immobilier à Dakar. Postez votre besoin gratuitement et laissez les vendeurs vous trouver.',
  alternates: { canonical: '/annonces' },
  openGraph: {
    title: 'Annonces — Wakhma Store',
    description: 'Parcourez les annonces à Dakar. Trouvez ce que vous cherchez sur le marketplace inversé #1 du Sénégal.',
  },
};

export default function AnnoncesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
