'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, ArrowLeft, Eye, EyeOff, UserPlus, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const referralCodeFromUrl = searchParams.get('ref') || '';
  const oauthError = searchParams.get('oauth');

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

  useEffect(() => {
    if (oauthError === 'error') {
      toast({
        title: 'Erreur de connexion',
        description: 'La connexion via réseau social a échoué. Veuillez réessayer.',
        variant: 'destructive',
      });
    } else if (oauthError === 'noemail') {
      toast({
        title: 'Email requis',
        description: 'Votre compte réseau social ne partage pas d\'email. Veuillez utiliser l\'inscription classique.',
        variant: 'destructive',
      });
    }
  }, [oauthError, toast]);

  function handleOAuthLogin(provider: 'google' | 'facebook') {
    setOauthLoading(provider);
    const ref = referralCodeFromUrl || '';
    window.location.href = `/api/auth/${provider}${ref ? `?ref=${ref}` : ''}`;
  }

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
        if (!data.user.phone) {
          router.push('/complete-profile');
        } else {
          router.push('/');
        }
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

    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires (y compris le téléphone)',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone
    const cleanPhone = registerForm.phone.replace(/\s/g, '');
    if (!/^(\+221|0)?[0-9]{9}$/.test(cleanPhone)) {
      toast({
        title: 'Erreur',
        description: 'Entrez un numéro de téléphone sénégalais valide (ex: 77 123 4567)',
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
          phone: cleanPhone,
          password: registerForm.password,
          referralCode: registerForm.referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        toast({
          title: 'Compte créé avec succès !',
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
                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl h-12 border-gray-200 hover:bg-gray-50 font-medium"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={oauthLoading !== null}
                      >
                        {oauthLoading === 'google' ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        Se connecter avec Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl h-12 border-gray-200 hover:bg-blue-50 font-medium text-[#1877F2]"
                        onClick={() => handleOAuthLogin('facebook')}
                        disabled={oauthLoading !== null}
                      >
                        {oauthLoading === 'facebook' ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                        Se connecter avec Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">ou par email</span>
                      </div>
                    </div>

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
                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl h-12 border-gray-200 hover:bg-gray-50 font-medium"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={oauthLoading !== null}
                      >
                        {oauthLoading === 'google' ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        S&apos;inscrire avec Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl h-12 border-gray-200 hover:bg-blue-50 font-medium text-[#1877F2]"
                        onClick={() => handleOAuthLogin('facebook')}
                        disabled={oauthLoading !== null}
                      >
                        {oauthLoading === 'facebook' ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                        S&apos;inscrire avec Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">ou par formulaire</span>
                      </div>
                    </div>

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
                        Téléphone * <span className="text-xs text-orange font-normal">(obligatoire)</span>
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
