'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Connexion réussie !',
          description: `Bienvenue, ${data.name || data.email}`,
        });
        router.push('/');
      } else {
        toast({
          title: 'Erreur de connexion',
          description: data.error || 'Identifiants incorrects',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-orange -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Card className="border-gray-100 rounded-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-8 h-8 text-orange" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Se connecter
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Accédez à votre compte Wakhma Store
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl border-gray-200 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="rounded-xl border-gray-200 h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Se connecter
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte ?{' '}
                  <button className="text-orange font-semibold hover:underline">
                    Créer un compte
                  </button>
                </p>
              </div>

              <div className="mt-4 p-3 bg-orange-bg rounded-xl">
                <p className="text-xs text-gray-600 text-center">
                  💡 Démo : <strong>demo@wakhmastore.com</strong> / <strong>demo123</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
