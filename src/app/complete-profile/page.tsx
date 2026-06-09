'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

function CompleteProfileContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, loadFromStorage, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user && user.phone) {
      router.push('/');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^(\+221|0)?[0-9]{9}$/.test(cleanPhone)) {
      toast({
        title: 'Numéro invalide',
        description: 'Entrez un numéro sénégalais valide (ex: 77 123 4567)',
        variant: 'destructive',
      });
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local user state
        if (user) {
          const updatedUser = { ...user, phone: cleanPhone };
          login(token, updatedUser);
        }
        toast({
          title: 'Profil complété !',
          description: 'Votre numéro de téléphone a été enregistré avec succès.',
        });
        router.push('/');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'enregistrement',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-gray-100 rounded-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Phone className="w-8 h-8 text-orange" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Numéro de téléphone requis
              </CardTitle>
              <p className="text-gray-500 text-sm mt-2">
                Pour utiliser Wakhma Store, vous devez obligatoirement renseigner votre numéro de téléphone.
                Cela permet aux acheteurs de vous contacter après avoir débloqué vos annonces.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium text-gray-700">
                    Numéro de téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+221 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-gray-200 h-12"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400">
                    Format : 77 123 4567 ou +221 77 123 4567
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Pourquoi ce numéro ?</p>
                      <p>Sur Wakhma Store, les vendeurs paient pour voir votre numéro. C&apos;est le cœur du marketplace inversé. Sans numéro, vous ne pouvez pas recevoir de contacts.</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base"
                  disabled={loading || !phone}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Valider mon numéro
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CompleteProfilePage() {
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
      <CompleteProfileContent />
    </Suspense>
  );
}
