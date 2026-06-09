'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, Star, Zap, Check, Loader2, Shield, Award,
  Smartphone, Building2, Wallet, CreditCard, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const SUBSCRIPTION_PLANS = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    icon: Zap,
    priceFcfa: 0,
    period: '/mois',
    unlockCost: 1500,
    description: 'Pour découvrir Wakhma Store',
    features: [
      'Débloque une annonce à 1 500 points',
      '3 annonces par mois',
      'Visibilité standard',
      'Support par email',
    ],
    color: 'gray',
    popular: false,
  },
  {
    id: 'diambar',
    name: 'Diambar',
    icon: Star,
    priceFcfa: 2000,
    period: '/mois',
    unlockCost: 1000,
    description: 'Pour les vendeurs actifs',
    features: [
      'Débloque une annonce à 1 000 points (au lieu de 1 500)',
      '15 annonces par mois',
      'Badge Diambar',
      'Annonces mises en avant',
      'Support prioritaire WhatsApp',
    ],
    color: 'blue',
    popular: false,
  },
  {
    id: 'vip_king',
    name: 'VIP KING',
    icon: Crown,
    priceFcfa: 5000,
    period: '/mois',
    unlockCost: 800,
    description: 'Pour les pros de la vente',
    features: [
      'Débloque une annonce à 800 points (au lieu de 1 500)',
      'Annonces illimitées',
      'Badge VIP KING',
      'Annonces en tête de liste',
      'Support prioritaire WhatsApp',
      'Statistiques détaillées',
      'Mise en avant hebdomadaire',
    ],
    color: 'orange',
    popular: true,
  },
];

const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', icon: Wallet, color: 'text-blue-600' },
  { id: 'orange_money', label: 'Orange Money', icon: Smartphone, color: 'text-orange' },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: Building2, color: 'text-gray-600' },
];

export default function AbonnementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, loadFromStorage, login } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('wave');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  async function handleSubscribe() {
    if (!selectedPlan || selectedPlan === 'gratuit' || !selectedPayment || !token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod: selectedPayment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update user plan in auth store
        if (user) {
          const updatedUser = { ...user, plan: data.newPlan };
          login(token, updatedUser);
        }

        toast({
          title: 'Abonnement activé !',
          description: data.message,
        });

        setSelectedPlan(null);
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'abonnement',
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-bg rounded-lg flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-orange" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold heading-compact text-gray-900">
            Abonnements
          </h1>
          <p className="text-gray-500 text-xs mt-1 max-w-xl mx-auto">
            Choisissez l&apos;abonnement qui vous convient et économisez sur le débloquage des annonces
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 mt-4 bg-orange/10 text-orange font-semibold px-3 py-1.5 rounded-full text-xs">
              <Award className="w-5 h-5" />
              Plan actuel : <span className="uppercase">{user.plan.replace('_', ' ')}</span>
              {' '}({user.plan === 'diambar' ? '1 000 pts/annonce' : user.plan === 'vip_king' ? '800 pts/annonce' : '1 500 pts/annonce'})
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isCurrentPlan = user?.plan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative rounded-lg transition-all ${
                  plan.popular
                    ? 'border-2 border-orange shadow-lg'
                    : 'border border-gray-100 hover:border-gray-200'
                } ${isSelected && plan.id !== 'gratuit' ? 'ring-2 ring-orange ring-offset-2' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-2.5">
                    Le plus populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                      plan.popular ? 'bg-orange/10' : 'bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-orange' : 'text-gray-500'}`} />
                  </div>
                  <CardTitle className="text-sm font-bold heading-compact text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-500 text-xs">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {plan.priceFcfa > 0 ? plan.priceFcfa.toLocaleString('fr-FR') : '0'}
                    </span>
                    <span className="text-gray-500 text-xs"> FCFA{plan.period}</span>
                  </div>

                  {/* Unlock cost highlight */}
                  <div className={`text-center p-2.5 rounded-lg ${
                    plan.id === 'gratuit'
                      ? 'bg-gray-50'
                      : plan.id === 'diambar'
                      ? 'bg-blue-50'
                      : 'bg-orange/10'
                  }`}>
                    <p className="text-xs text-gray-500 mb-1">Coût pour débloquer une annonce</p>
                    <p className={`text-lg font-bold ${
                      plan.id === 'gratuit'
                        ? 'text-gray-700'
                        : 'text-orange'
                    }`}>
                      {plan.unlockCost.toLocaleString('fr-FR')} points
                    </p>
                    {plan.id !== 'gratuit' && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Économisez {((1500 - plan.unlockCost) / 1500 * 100).toFixed(0)}% vs gratuit
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className={`w-4 h-4 flex-shrink-0 ${
                            plan.popular ? 'text-orange' : 'text-green-500'
                          }`}
                        />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'gratuit' ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-lg h-9 text-xs font-semibold border-gray-200 text-gray-500"
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Plan actuel' : 'Plan par défaut'}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full rounded-lg h-9 text-xs font-semibold ${
                        plan.popular
                          ? 'bg-orange hover:bg-orange-dark text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      disabled={isCurrentPlan}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {isCurrentPlan ? 'Plan actuel' : `Choisir ${plan.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Modal (inline) */}
        {selectedPlan && selectedPlan !== 'gratuit' && (
          <Card className="border-gray-100 rounded-lg max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange" />
                Souscrire à {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        selectedPayment === method.id
                          ? 'border-orange bg-orange/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <Icon className={`w-5 h-5 ${method.color}`} />
                      <span className="font-medium text-gray-700">{method.label}</span>
                      {selectedPayment === method.id && (
                        <Check className="w-5 h-5 text-orange ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Abonnement</span>
                  <span className="font-medium text-gray-900">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Débloquage par annonce</span>
                  <span className="font-medium text-orange">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.unlockCost.toLocaleString('fr-FR')} pts
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total / mois</span>
                  <span className="text-xl font-bold text-gray-900">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.priceFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Le paiement est simulé en mode démo. En production, vous seriez redirigé vers {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg h-10 text-sm font-semibold"
                  onClick={() => setSelectedPlan(null)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg h-10 text-sm"
                  disabled={loading}
                  onClick={handleSubscribe}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Souscrire
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="mt-8 max-w-2xl mx-auto">
          <h2 className="text-sm font-bold heading-compact text-gray-900 text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Comment fonctionne l&apos;abonnement ?
              </h3>
              <p className="text-xs text-gray-600">
                L&apos;abonnement réduit le coût de débloquage des annonces. Avec Diambar, vous payez 1 000 points au lieu de 1 500, et avec VIP KING seulement 800 points. L&apos;abonnement dure 30 jours et se renouvelle automatiquement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Puis-je changer de plan ?
              </h3>
              <p className="text-xs text-gray-600">
                Oui, vous pouvez upgrader à tout moment. Le nouveau plan sera actif immédiatement et les avantages appliqués dès votre prochain achat de points.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Comment puis-je payer ?
              </h3>
              <p className="text-xs text-gray-600">
                Nous acceptons Wave, Orange Money et les transferts bancaires. Contactez-nous sur WhatsApp pour finaliser votre paiement.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
