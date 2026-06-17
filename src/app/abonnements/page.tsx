'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, Star, Zap, Check, Award,
  ChevronDown, ChevronUp, CreditCard, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { getSubscriptionPaymentUrl } from '@/lib/constants';

const SUBSCRIPTION_PLANS = [
  {
    id: 'gratuit',
    name: 'BOLT ⚡',
    icon: Zap,
    priceFcfa: 2000,
    period: '/mois',
    unlockCost: 1500,
    pointsIncluded: 15000,
    annoncesVends: 3,
    description: 'Pour commencer à vendre sur Wakhma',
    features: [
      '15 000 points offerts',
      '3 annonces « Je vends » par mois',
      'Débloque une annonce à 1 500 points',
      'Badge ⚡ DIAMBAR',
      'Visibilité standard',
      'Support par email',
    ],
    color: 'blue',
    popular: false,
  },
  {
    id: 'diambar',
    name: 'DIAMBAR 💪🏽',
    icon: Star,
    priceFcfa: 5000,
    period: '/mois',
    unlockCost: 1000,
    pointsIncluded: 26000,
    annoncesVends: 5,
    description: 'Pour les vendeurs actifs',
    features: [
      '26 000 points inclus',
      '5 annonces « Je vends » par mois',
      'Débloque une annonce à 1 000 points (au lieu de 1 500)',
      'Badge 💪🏽 DIAMBAR',
      'Annonces mises en avant',
      'Support prioritaire WhatsApp',
    ],
    color: 'green',
    popular: false,
  },
  {
    id: 'vip_king',
    name: 'VIP KING 👑',
    icon: Crown,
    priceFcfa: 9900,
    period: '/mois',
    unlockCost: 800,
    pointsIncluded: 49000,
    annoncesVends: 5,
    description: 'Pour les pros de la vente',
    features: [
      '49 000 points inclus',
      '5 annonces « Je vends » par semaine',
      'Débloque une annonce à 800 points (au lieu de 1 500)',
      'Badge VIP KING',
      'Annonces en tête de liste',
      'Support prioritaire WhatsApp',
      'Statistiques détaillées',
      'Mise en avant hebdomadaire',
    ],
    color: 'gold',
    popular: true,
  },
];

const PLAN_COLORS: Record<string, { bg: string; bgLight: string; text: string; border: string; btn: string; check: string }> = {
  gratuit: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-500',
    btn: 'bg-blue-500 hover:bg-blue-600',
    check: 'text-blue-500',
  },
  diambar: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-500',
    btn: 'bg-green-500 hover:bg-green-600',
    check: 'text-green-500',
  },
  vip_king: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-500',
    btn: 'bg-amber-500 hover:bg-amber-600',
    check: 'text-amber-500',
  },
};

// Payment block — now just a direct checkout link
function PlanPaymentBlock({ plan }: { plan: typeof SUBSCRIPTION_PLANS[0] }) {
  const colors = PLAN_COLORS[plan.id];
  const paymentUrl = getSubscriptionPaymentUrl(plan.id);

  return (
    <div className="space-y-3">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Abonnement</span>
          <span className="font-medium text-gray-900">{plan.name}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Points inclus</span>
          <span className="font-medium text-orange">+{plan.pointsIncluded.toLocaleString('fr-FR')}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Débloquage par annonce</span>
          <span className={`font-medium ${colors.text}`}>{plan.unlockCost.toLocaleString('fr-FR')} pts</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-medium text-gray-700 text-xs">Total à payer</span>
          <span className="text-lg font-bold text-gray-900">{plan.priceFcfa.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Direct payment button */}
      <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block">
        <Button
          className={`w-full ${colors.btn} text-white font-semibold rounded-xl h-12 text-sm`}
          type="button"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Payer maintenant
        </Button>
      </a>

      <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-green-800">
          Paiement sécurisé via Wave ou Orange Money. Activation automatique de votre abonnement après confirmation du paiement.
        </p>
      </div>
    </div>
  );
}

export default function AbonnementsPage() {
  const router = useRouter();
  const { user, loadFromStorage } = useAuth();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/abonnements');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold heading-compact text-gray-900">
            Abonnements
          </h1>
          <p className="text-gray-500 text-xs mt-1 max-w-xl mx-auto">
            Choisissez l&apos;abonnement qui vous convient et économisez sur le débloquage des annonces
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 mt-4 bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-full text-xs">
              <Award className="w-5 h-5" />
              Plan actuel : <span className="uppercase">{user.plan === 'none' ? 'Sans abonnement' : user.plan === 'gratuit' ? 'BOLT ⚡' : user.plan.replace('_', ' ')}</span>
              {' '}{user.plan !== 'none' && `(${user.plan === 'diambar' ? '1 000 pts/annonce' : user.plan === 'vip_king' ? '800 pts/annonce' : '1 500 pts/annonce'})`}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.plan === plan.id;
            const isExpanded = expandedPlan === plan.id;
            const colors = PLAN_COLORS[plan.id];

            return (
              <Card
                key={plan.id}
                className={`relative rounded-xl transition-all ${
                  plan.popular
                    ? `border-2 ${colors.border} shadow-lg`
                    : 'border border-gray-100 hover:border-gray-200'
                }`}
              >
                {plan.popular && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.bg} text-white border-0 font-semibold px-2.5`}>
                    Le plus populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${colors.bgLight}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-sm font-bold heading-compact text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-500 text-xs">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {plan.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-gray-500 text-xs"> FCFA{plan.period}</span>
                  </div>

                  {/* Unlock cost */}
                  <div className={`text-center p-2.5 rounded-lg ${colors.bgLight}`}>
                    <p className="text-xs text-gray-500 mb-1">Coût pour débloquer une annonce</p>
                    <p className={`text-lg font-bold ${colors.text}`}>
                      {plan.unlockCost.toLocaleString('fr-FR')} points
                    </p>
                    {plan.id !== 'gratuit' && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Économisez {((1500 - plan.unlockCost) / 1500 * 100).toFixed(0)}% vs BOLT
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 flex-shrink-0 ${colors.check}`} />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Choose / expand button */}
                  <Button
                    className={`w-full rounded-xl h-10 text-xs font-semibold text-white ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isExpanded
                        ? 'bg-gray-800 hover:bg-gray-900'
                        : colors.btn
                    }`}
                    disabled={isCurrentPlan}
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  >
                    {isCurrentPlan ? 'Plan actuel' : isExpanded ? (
                      <span className="flex items-center gap-2">
                        <ChevronUp className="w-4 h-4" />
                        Masquer le paiement
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Choisir {plan.name}
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  {/* Inline payment */}
                  {isExpanded && !isCurrentPlan && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <PlanPaymentBlock plan={plan} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
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
                L&apos;abonnement réduit le coût de débloquage des annonces. Avec le plan BOLT ⚡ (2 000 FCFA), vous recevez 15 000 points, 3 annonces « Je vends » et le badge ⚡ DIAMBAR. Avec DIAMBAR 💪🏽 (5 000 FCFA), vous recevez 26 000 points, 5 annonces « Je vends » et payez 1 000 points par débloquage. Avec VIP KING 👑 (9 900 FCFA), vous recevez 49 000 points, 5 annonces « Je vends » par semaine et payez seulement 800 points par débloquage. L&apos;abonnement dure 30 jours et se renouvelle automatiquement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Comment payer ?
              </h3>
              <p className="text-xs text-gray-600">
                Cliquez sur « Choisir » puis sur « Payer maintenant ». Vous serez redirigé vers notre page de paiement sécurisée où vous pourrez payer via Wave ou Orange Money. L&apos;activation de votre abonnement est automatique après confirmation du paiement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Puis-je changer de plan ?
              </h3>
              <p className="text-xs text-gray-600">
                Oui, vous pouvez upgrader à tout moment. Le nouveau plan sera actif immédiatement après validation de votre paiement et les avantages appliqués dès confirmation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
