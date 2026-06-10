'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const sessionResult = useSession();
  const data = sessionResult?.data;
  const status = sessionResult?.status ?? 'loading';
  const session = data;
  const { login } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && session?.customToken && session?.customUser) {
      // Store the custom JWT token in our Zustand auth store
      login(session.customToken, {
        id: session.customUser.id,
        name: session.customUser.name || '',
        email: session.customUser.email,
        phone: session.customUser.phone || undefined,
        role: session.customUser.role,
        plan: session.customUser.plan,
        points: session.customUser.points,
        referralCode: session.customUser.referralCode,
        image: session.customUser.image || undefined,
      });

      // Redirect to home
      router.push('/');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connexion en cours...
        </h2>
        <p className="text-gray-500">
          Vérification de votre compte, veuillez patienter.
        </p>
      </div>
    </div>
  );
}
