import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — Créez votre compte',
  description: 'Connectez-vous ou créez un compte gratuit sur Wakhma Store. Accédez au marketplace inversé #1 de Dakar, Sénégal.',
  alternates: { canonical: '/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
