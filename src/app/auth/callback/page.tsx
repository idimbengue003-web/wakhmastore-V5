'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Read OAuth data from cookies set by the server-side callback
    async function processOAuth() {
      try {
        const res = await fetch('/api/auth/oauth-exchange', {
          method: 'POST',
          credentials: 'include', // Include cookies
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            login(data.user);
            router.push('/');
          } else {
            router.push('/login?oauth=error');
          }
        } else {
          router.push('/login?oauth=error');
        }
      } catch {
        router.push('/login?oauth=error');
      }
    }

    processOAuth();
  }, [login, router]);

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
