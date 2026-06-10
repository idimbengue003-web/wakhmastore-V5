'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, Star, Zap, Check, Award,
  Smartphone, Wallet, MessageCircle, Send, Copy, AlertCircle,
  Phone, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PAYMENT_PHONE, WHATSAPP_LINK, WHATSAPP_NUMBER } from '@/lib/constants';

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

// Payment block for inline use
function PlanPaymentBlock({ plan }: { plan: typeof SUBSCRIPTION_PLANS[0] }) {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<'wave' | 'orange_money'>('wave');
  const [proofRef, setProofRef] = useState('');
  const colors = PLAN_COLORS[plan.id];

  function getWhatsAppLink() {
    const methodName = selectedPayment === 'wave' ? 'Wave' : 'Orange Money';
    const message = `Bonjour Wakhma Store !\n\nJe souhaite souscrire à l'abonnement *${plan.name}* (${plan.priceFcfa.toLocaleString('fr-FR')} FCFA/mois).\n\nMéthode : *${methodName}*\nRéférence : ${proofRef || '(à compléter)'}\n\nMerci de confirmer la réception !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="space-y-3">
      <Separator />

      {/* Payment methods */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${colors.btn} text-white text-[10px] flex items-center justify-center font-bold`}>1</span>
        Méthode de paiement
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
            selectedPayment === 'wave'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-100 text-gray-500 hover:border-gray-200'
          }`}
          onClick={() => setSelectedPayment('wave')}
        >
          <Wallet className="w-4 h-4" />
          Wave
          {selectedPayment === 'wave' && <Check className="w-3.5 h-3.5 ml-auto" />}
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
            selectedPayment === 'orange_money'
              ? 'border-orange bg-orange/5 text-orange'
              : 'border-gray-100 text-gray-500 hover:border-gray-200'
          }`}
          onClick={() => setSelectedPayment('orange_money')}
        >
          <Smartphone className="w-4 h-4" />
          Orange Money
          {selectedPayment === 'orange_money' && <Check className="w-3.5 h-3.5 ml-auto" />}
        </button>
      </div>

      {/* Phone number */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${colors.btn} text-white text-[10px] flex items-center justify-center font-bold`}>2</span>
        Envoyez {plan.priceFcfa.toLocaleString('fr-FR')} FCFA
      </p>
      <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5 border border-green-200">
        <div>
          <p className="text-[10px] text-gray-500">Numéro {selectedPayment === 'wave' ? 'Wave' : 'Orange Money'}</p>
          <p className="text-base font-bold text-gray-900">{PAYMENT_PHONE}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2"
          onClick={() => {
            navigator.clipboard.writeText(PAYMENT_PHONE.replace(/\s/g, ''));
            toast({ title: 'Copié !', description: 'Numéro copié' });
          }}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      {/* Reference */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${colors.btn} text-white text-[10px] flex items-center justify-center font-bold`}>3</span>
        Référence du paiement
      </p>
      <Input
        type="text"
        placeholder="Ex: TXN123456 ou réf. Orange Money"
        value={proofRef}
        onChange={(e) => setProofRef(e.target.value)}
        className="rounded-xl border-gray-200 h-10 text-xs"
      />

      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Abonnement</span>
          <span className="font-medium text-gray-900">{plan.name}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Débloquage par annonce</span>
          <span className={`font-medium ${colors.text}`}>{plan.unlockCost.toLocaleString('fr-FR')} pts</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-medium text-gray-700 text-xs">Montant à envoyer / mois</span>
          <span className="text-lg font-bold text-gray-900">{plan.priceFcfa.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl h-11 text-sm"
            type="button"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Envoyer la preuve via WhatsApp
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </a>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full rounded-xl h-10 text-xs font-semibold border-green-300 text-green-700 hover:bg-green-50"
            type="button"
          >
            <Phone className="w-4 h-4 mr-1.5" />
            Accélérer ma demande sur WhatsApp
          </Button>
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-800">
          Votre abonnement sera activé sous 30 min après validation du paiement.
        </p>
      </div>
    </div>
  );
}

export default function AbonnementsPage() {
  const router = useRouter();
  const { toast } = useToast();
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
                Comment payer via WhatsApp ?
              </h3>
              <p className="text-xs text-gray-600">
                Choisissez votre méthode (Wave ou Orange Money), envoyez le montant au numéro indiqué dans chaque carte, puis cliquez sur « Envoyer la preuve via WhatsApp » pour nous envoyer la capture d&apos;écran de confirmation. Vous pouvez aussi cliquer sur « Accélérer ma demande » pour nous contacter directement. Votre compte sera crédité sous 30 minutes après validation.
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
