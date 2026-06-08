'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, ArrowLeft, Eye, EyeOff, UserPlus, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login, loadFromStorage, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const referralCodeFromUrl = searchParams.get('ref') || '';

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCodeFromUrl,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token]);

  useEffect(() => {
    if (referralCodeFromUrl) {
      setActiveTab('register');
    }
  }, [referralCodeFromUrl]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
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
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        toast({
          title: 'Connexion réussie !',
          description: `Bienvenue, ${data.user.name || data.user.email}`,
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
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (registerForm.password.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }

    if (!/[A-Z]/.test(registerForm.password)) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins une majuscule',
        variant: 'destructive',
      });
      return;
    }

    if (!/[0-9]/.test(registerForm.password)) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins un chiffre',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone || undefined,
          password: registerForm.password,
          referralCode: registerForm.referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        toast({
          title: 'Compte créé avec succès ! 🎉',
          description: registerForm.referralCode
            ? 'Bienvenue ! Le code de parrainage a été appliqué.'
            : `Bienvenue sur Wakhma Store, ${data.user.name} !`,
        });
        router.push('/');
      } else {
        toast({
          title: 'Erreur d\'inscription',
          description: data.error || 'Erreur lors de la création du compte',
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
  }

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
                Wakhma Store
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Connecte-toi ou crée un compte
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="rounded-lg">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscription
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="rounded-xl border-gray-200 h-12"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-medium text-gray-700">
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Votre mot de passe"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="rounded-xl border-gray-200 h-12 pr-12"
                          autoComplete="current-password"
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
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="font-medium text-gray-700">
                        Nom complet *
                      </Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Votre nom"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="rounded-xl border-gray-200 h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="font-medium text-gray-700">
                        Email *
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="rounded-xl border-gray-200 h-12"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="font-medium text-gray-700">
                        Téléphone
                      </Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+221 77 123 4567"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="rounded-xl border-gray-200 h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="font-medium text-gray-700">
                        Mot de passe *
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="rounded-xl border-gray-200 h-12 pr-12"
                          autoComplete="new-password"
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

                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password" className="font-medium text-gray-700">
                        Confirmer le mot de passe *
                      </Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder="Retapez votre mot de passe"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="rounded-xl border-gray-200 h-12"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-referral" className="font-medium text-gray-700 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-orange" />
                        Code de parrainage
                      </Label>
                      <Input
                        id="reg-referral"
                        type="text"
                        placeholder="WK-XXXXXX (optionnel)"
                        value={registerForm.referralCode}
                        onChange={(e) => setRegisterForm({ ...registerForm, referralCode: e.target.value.toUpperCase() })}
                        className="rounded-xl border-gray-200 h-12 font-mono uppercase"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Création du compte...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Créer mon compte
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
