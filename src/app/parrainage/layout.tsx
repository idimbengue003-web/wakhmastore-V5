import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Parrainage — Gagnez 400 points par filleul',
  description: 'Parrainez vos amis sur Wakhma Store et gagnez 400 points par filleul, jusqu\'à 30 000 points. Programme de parrainage gratuit et sans engagement.',
  alternates: { canonical: '/parrainage' },
  openGraph: {
    title: 'Parrainage — Wakhma Store',
    description: 'Invitez vos amis et gagnez des points gratuits sur Wakhma Store.',
  },
};

export default function ParrainageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
