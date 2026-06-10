'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, ArrowLeft, UserPlus, Gift, Loader2, ShieldCheck, Phone } from 'lucide-react';
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
  const { login, loadFromStorage, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const referralCodeFromUrl = searchParams.get('ref') || '';

  // Login form — email + 4-digit PIN
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginPin, setLoginPin] = useState('');

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCodeFromUrl,
  });

  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (referralCodeFromUrl) {
      setActiveTab('register');
    }
  }, [referralCodeFromUrl]);

  // ---- PIN Input: single field with visual boxes ----
  function handlePinInput(value: string, setPin: (v: string) => void) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
  }

  // ---- Login ----
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!loginForm.email || loginPin.length !== 4) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir votre email et votre code PIN',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginPin }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
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

  // ---- Register ----
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires (nom, email, téléphone)',
        variant: 'destructive',
      });
      return;
    }

    if (regPin.length !== 4) {
      toast({
        title: 'Erreur',
        description: 'Le code PIN doit contenir 4 chiffres',
        variant: 'destructive',
      });
      return;
    }

    if (regPin !== regConfirmPin) {
      toast({
        title: 'Erreur',
        description: 'Les codes PIN ne correspondent pas',
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
          phone: registerForm.phone.replace(/\s/g, ''),
          password: regPin,
          referralCode: registerForm.referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
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

  // ---- PIN Input: single hidden input + 4 visual boxes ----
  function PinInput({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
  }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    }, [value, onChange]);

    return (
      <div className="relative flex justify-center" onClick={() => inputRef.current?.focus()}>
        {/* Hidden single input — keeps keyboard open on mobile */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          value={value}
          onChange={(e) => handlePinInput(e.target.value, onChange)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          style={{ fontSize: '16px' }} /* prevents iOS zoom */
        />
        {/* 4 visual boxes */}
        <div className="flex gap-2 pointer-events-none">
          {[0, 1, 2, 3].map((i) => {
            const filled = i < value.length;
            const isCurrent = i === value.length && focused;
            return (
              <div
                key={i}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all duration-150 ${
                  isCurrent
                    ? 'border-orange ring-2 ring-orange/30 bg-orange/5'
                    : filled
                    ? 'border-orange/40 bg-orange/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {filled ? (
                  <span className="text-gray-800">•</span>
                ) : isCurrent ? (
                  <span className="w-0.5 h-6 bg-orange animate-pulse rounded-full" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
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

          <Card className="border-gray-100 rounded-2xl transition-all duration-500">
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

                {/* ============ LOGIN FORM ============ */}
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
                        className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700 text-center w-full block">
                        Code PIN (4 chiffres)
                      </Label>
                      <PinInput value={loginPin} onChange={setLoginPin} />
                    </div>

                    <Button
                      type="submit"
                      className="btn-press w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base transition-all duration-300"
                      disabled={loading || loginPin.length !== 4}
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

                {/* ============ REGISTER FORM ============ */}
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
                        className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
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
                        className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                        autoComplete="email"
                      />
                    </div>

                    {/* Phone number — required */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange" />
                        Numéro de téléphone *
                      </Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="77 123 45 67"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                      />
                      <p className="text-xs text-gray-400">
                        Format : 77 123 45 67 ou +221 77 123 45 67
                      </p>
                    </div>

                    {/* Code PIN */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">
                        Code PIN (4 chiffres) *
                      </Label>
                      <PinInput value={regPin} onChange={setRegPin} />
                      <p className="text-xs text-gray-400 text-center">
                        Ce code sera votre mot de passe
                      </p>
                    </div>

                    {/* Confirm PIN */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">
                        Confirmer le code PIN *
                      </Label>
                      <PinInput value={regConfirmPin} onChange={setRegConfirmPin} />
                      {regPin.length === 4 && regConfirmPin.length === 4 && regPin !== regConfirmPin && (
                        <p className="text-xs text-red-500 text-center">Les codes PIN ne correspondent pas</p>
                      )}
                      {regPin.length === 4 && regConfirmPin.length === 4 && regPin === regConfirmPin && (
                        <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Codes PIN identiques
                        </p>
                      )}
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
                        className="rounded-xl border-gray-200 h-12 font-mono uppercase transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="btn-press w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base transition-all duration-300"
                      disabled={loading || regPin.length !== 4 || regPin !== regConfirmPin}
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
