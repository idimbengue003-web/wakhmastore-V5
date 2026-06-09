'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        login(token, user);

        // If user has no phone, redirect to complete-profile
        if (!user.phone) {
          router.push('/complete-profile');
        } else {
          router.push('/');
        }
      } catch {
        router.push('/login?oauth=error');
      }
    } else {
      router.push('/login?oauth=error');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Connexion en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter quelques instants</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange animate-spin" />
        </main>
        <Footer />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
