'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, Star, Zap, Check, Award,
  Smartphone, Wallet, MessageCircle, Send, Copy, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const WHATSAPP_NUMBER = '221789271296';

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

// Color configs per plan
const PLAN_COLORS: Record<string, { bg: string; bgLight: string; text: string; border: string; btn: string; btnHover: string; icon: string; check: string }> = {
  gratuit: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-500',
    btn: 'bg-blue-500 hover:bg-blue-600',
    btnHover: 'hover:bg-blue-600',
    icon: 'text-blue-500',
    check: 'text-blue-500',
  },
  diambar: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-500',
    btn: 'bg-green-500 hover:bg-green-600',
    btnHover: 'hover:bg-green-600',
    icon: 'text-green-500',
    check: 'text-green-500',
  },
  vip_king: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-500',
    btn: 'bg-amber-500 hover:bg-amber-600',
    btnHover: 'hover:bg-amber-600',
    icon: 'text-amber-500',
    check: 'text-amber-500',
  },
};

const PAYMENT_METHODS = [
  {
    id: 'wave',
    label: 'Wave',
    icon: Wallet,
    color: 'text-blue-600',
    number: '78 927 12 96',
    instructions: 'Envoyez le montant au numéro Wave ci-dessus, puis envoyez la capture d\'écran de la confirmation via WhatsApp.',
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    icon: Smartphone,
    color: 'text-orange',
    number: '78 927 12 96',
    instructions: 'Envoyez le montant au numéro Orange Money ci-dessus, puis envoyez la capture d\'écran de la confirmation via WhatsApp.',
  },
];

export default function AbonnementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, loadFromStorage } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('wave');
  const [proofRef, setProofRef] = useState('');

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  function getWhatsAppLink() {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    const method = PAYMENT_METHODS.find(m => m.id === selectedPayment);
    const message = `Bonjour Wakhma Store !\n\nJe souhaite souscrire à l\'abonnement *${plan?.name}* (${plan?.priceFcfa.toLocaleString('fr-FR')} FCFA/mois).\n\nMéthode de paiement : *${method?.label}*\nRéférence / ID transaction : ${proofRef || '(à compléter)'}\n\nMerci de confirmer la réception du paiement !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast({
      title: 'Copié !',
      description: 'Numéro copié dans le presse-papier',
    });
  }

  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);

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
            const colors = PLAN_COLORS[plan.id];

            return (
              <Card
                key={plan.id}
                className={`relative rounded-lg transition-all ${
                  plan.popular
                    ? `border-2 ${colors.border} shadow-lg`
                    : 'border border-gray-100 hover:border-gray-200'
                } ${isSelected ? `ring-2 ${colors.border} ring-offset-2` : ''}`}
              >
                {plan.popular && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.bg} text-white border-0 font-semibold px-2.5`}>
                    Le plus populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${colors.bgLight}`}
                  >
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <CardTitle className="text-sm font-bold heading-compact text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-500 text-xs">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {plan.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-gray-500 text-xs"> FCFA{plan.period}</span>
                  </div>

                  {/* Unlock cost highlight */}
                  <div className={`text-center p-2.5 rounded-lg ${colors.bgLight}`}>
                    <p className="text-xs text-gray-500 mb-1">Coût pour débloquer une annonce</p>
                    <p className={`text-lg font-bold ${colors.text}`}>
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
                        <Check className={`w-4 h-4 flex-shrink-0 ${colors.check}`} />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-lg h-9 text-xs font-semibold text-white ${colors.btn}`}
                    disabled={isCurrentPlan}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isCurrentPlan ? 'Plan actuel' : `Choisir ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Instructions */}
        {selectedPlan && (
          <Card className="border-gray-100 rounded-lg max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Instructions de paiement — {selectedPlanData?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Choose method */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Choisissez votre méthode de paiement
                </p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          selectedPayment === method.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <Icon className={`w-5 h-5 ${method.color}`} />
                        <span className="font-medium text-gray-700">{method.label}</span>
                        {selectedPayment === method.id && (
                          <Check className="w-5 h-5 text-amber-500 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Step 2: Send payment */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Envoyez le paiement
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-green-800 font-medium">
                    {selectedMethod?.instructions}
                  </p>
                  <div className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-green-100">
                    <div>
                      <p className="text-[10px] text-gray-500">Numéro {selectedMethod?.label}</p>
                      <p className="text-sm font-bold text-gray-900">{selectedMethod?.number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2"
                      onClick={() => copyToClipboard(selectedMethod?.number || '')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Abonnement</span>
                  <span className="font-medium text-gray-900">{selectedPlanData?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Débloquage par annonce</span>
                  <span className="font-medium text-amber-600">
                    {selectedPlanData?.unlockCost.toLocaleString('fr-FR')} pts
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant à envoyer / mois</span>
                  <span className="text-xl font-bold text-gray-900">
                    {selectedPlanData?.priceFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <Separator />

              {/* Step 3: Reference */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Indiquez la référence du paiement
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="proof-ref" className="text-xs text-gray-600">
                    ID de transaction ou référence (optionnel)
                  </Label>
                  <Input
                    id="proof-ref"
                    type="text"
                    placeholder="Ex: TXN123456 ou réf. Orange Money"
                    value={proofRef}
                    onChange={(e) => setProofRef(e.target.value)}
                    className="rounded-lg border-gray-200 h-10 text-xs"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Après avoir envoyé le paiement, cliquez sur le bouton ci-dessous pour nous envoyer la preuve via WhatsApp. Votre abonnement sera activé dès validation (sous 30 min).
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg h-11 text-sm font-semibold"
                  onClick={() => setSelectedPlan(null)}
                >
                  Annuler
                </Button>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-11 text-sm"
                    type="button"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Envoyer la preuve
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </a>
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
                L&apos;abonnement réduit le coût de débloquage des annonces. Avec le plan BOLT ⚡ (2 000 FCFA), vous recevez 15 000 points, 3 annonces « Je vends » et le badge ⚡ DIAMBAR. Avec DIAMBAR 💪🏽 (5 000 FCFA), vous recevez 26 000 points, 5 annonces « Je vends » et payez 1 000 points par débloquage. Avec VIP KING 👑 (9 900 FCFA), vous recevez 49 000 points, 5 annonces « Je vends » par semaine et payez seulement 800 points par débloquage. L&apos;abonnement dure 30 jours et se renouvelle automatiquement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs heading-compact">
                Comment payer via WhatsApp ?
              </h3>
              <p className="text-xs text-gray-600">
                Choisissez votre méthode (Wave ou Orange Money), envoyez le montant au numéro indiqué, puis cliquez sur « Envoyer la preuve via WhatsApp » pour nous envoyer la capture d&apos;écran de confirmation. Votre compte sera crédité sous 30 minutes après validation.
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
