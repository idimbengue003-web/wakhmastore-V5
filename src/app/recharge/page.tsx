'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, Crown, Star, Zap, Coins, Sparkles, ShieldCheck,
  Phone, Copy, MessageCircle, Send, Wallet, Smartphone,
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { PLANS, POINT_PACKAGES, PAYMENT_PHONE, WHATSAPP_LINK, WHATSAPP_NUMBER } from '@/lib/constants';
import type { PlanId } from '@/lib/constants';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>;
}

// Payment block component — reused inside each card
function PaymentBlock({ amount, label, color = 'orange' }: { amount: number; label: string; color?: string }) {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<'wave' | 'orange_money'>('wave');
  const [proofRef, setProofRef] = useState('');

  const colorClass = color === 'amber' ? 'amber' : color === 'green' ? 'green' : 'orange';
  const btnBg = color === 'amber' ? 'bg-amber-500 hover:bg-amber-600'
    : color === 'green' ? 'bg-green-500 hover:bg-green-600'
    : 'bg-orange hover:bg-orange-dark';

  function getWhatsAppLink() {
    const methodName = selectedPayment === 'wave' ? 'Wave' : 'Orange Money';
    const message = `Bonjour Wakhma Store !\n\nJe souhaite payer : *${label}* (${amount.toLocaleString('fr-FR')} FCFA).\n\nMéthode : *${methodName}*\nRéférence : ${proofRef || '(à compléter)'}\n\nMerci de confirmer la réception !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="space-y-3">
      <Separator />

      {/* Payment methods */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${btnBg} text-white text-[10px] flex items-center justify-center font-bold`}>1</span>
        Méthode de paiement
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
            selectedPayment === 'wave'
              ? `border-blue-500 bg-blue-50 text-blue-700`
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

      {/* Phone number + copy */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${btnBg} text-white text-[10px] flex items-center justify-center font-bold`}>2</span>
        Envoyez {amount.toLocaleString('fr-FR')} FCFA
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

      {/* Reference input */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className={`w-5 h-5 rounded-full ${btnBg} text-white text-[10px] flex items-center justify-center font-bold`}>3</span>
        Référence du paiement
      </p>
      <Input
        type="text"
        placeholder="Ex: TXN123456 ou réf. Orange Money"
        value={proofRef}
        onChange={(e) => setProofRef(e.target.value)}
        className="rounded-xl border-gray-200 h-10 text-xs"
      />

      {/* Two action buttons */}
      <div className="space-y-2">
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl h-11 text-sm transition-all duration-300`}
            type="button"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Envoyer la preuve via WhatsApp
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
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
          Votre {label.toLowerCase()} sera activé sous 30 min après validation du paiement.
        </p>
      </div>
    </div>
  );
}

export default function RechargePage() {
  const router = useRouter();
  const { user, isLoading, loadFromStorage, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'plans' | 'points'>('plans');
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/recharge');
    }
  }, [user, isLoading, router]);

  async function handleSubscribe(planId: PlanId) {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour choisir un plan', variant: 'destructive' });
      return;
    }
    if (user?.plan === planId) {
      toast({ title: 'Déjà activé', description: 'Vous avez déjà ce plan' });
      return;
    }
    setSubscribing(planId);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Plan activé !',
          description: data.message || `Plan ${PLANS[planId].name} activé avec succès`,
        });
        updateUser({ plan: planId, points: data.points || user?.points });
        window.location.reload();
      } else {
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de l\'activation', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setSubscribing(null);
    }
  }

  const planEntries = Object.values(PLANS).filter(p => p.id !== 'none');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            100% GRATUIT pour les acheteurs
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Abonnements & Points
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Les abonnements sont réservés aux <strong>vendeurs</strong>. Les acheteurs postent leurs demandes gratuitement !
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 bg-orange/10 text-orange px-4 py-2 rounded-full text-sm font-semibold mt-3">
              <Coins className="w-4 h-4" />
              Solde : {user.points.toLocaleString('fr-FR')} points
            </div>
          )}
        </Section>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-xl p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'plans' ? 'bg-white text-orange shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Crown className="w-4 h-4 inline mr-1.5" />
              Abonnements Vendeurs
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'points' ? 'bg-white text-orange shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Coins className="w-4 h-4 inline mr-1.5" />
              Acheter des Points
            </button>
          </div>
        </div>

        {/* ============ PLANS TAB ============ */}
        {activeTab === 'plans' && (
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planEntries.map((plan) => {
                const isPopular = plan.id === 'vip_king';
                const isCurrentPlan = user?.plan === plan.id;
                const isExpanded = expandedPlan === plan.id;
                const cardColor = isPopular ? 'amber' : plan.id === 'diambar' ? 'green' : 'blue';
                const btnBg = isPopular ? 'bg-amber-500 hover:bg-amber-600'
                  : plan.id === 'diambar' ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600';

                return (
                  <Card
                    key={plan.id}
                    className={`relative rounded-2xl border-2 transition-all duration-500 ease-out hover:-translate-y-1 ${
                      isPopular
                        ? 'border-amber-500 shadow-xl shadow-amber-500/10 md:scale-[1.02]'
                        : plan.id === 'diambar'
                        ? 'border-green-200 hover:border-green-300'
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0 font-semibold px-4">
                        Le plus populaire
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110 ${
                          isPopular ? 'bg-amber-50' : plan.id === 'diambar' ? 'bg-green-50' : 'bg-blue-50'
                        }`}
                      >
                        {plan.id === 'vip_king' ? (
                          <Crown className="w-8 h-8 text-amber-500" />
                        ) : plan.id === 'diambar' ? (
                          <Star className="w-8 h-8 text-green-500" />
                        ) : (
                          <Zap className="w-8 h-8 text-blue-500" />
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {plan.price.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-gray-500 text-sm"> FCFA{plan.period}</span>
                      </div>

                      {/* Points included */}
                      {plan.points > 0 && (
                        <div className={`text-center py-2 px-4 rounded-xl ${
                          isPopular ? 'bg-amber-50 text-amber-600' : plan.id === 'diambar' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Coins className="w-4 h-4 inline mr-1" />
                          <span className="font-bold">{plan.points.toLocaleString('fr-FR')} points</span> offerts
                        </div>
                      )}

                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                isPopular ? 'text-amber-500' : plan.id === 'diambar' ? 'text-green-500' : 'text-blue-500'
                              }`}
                            />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Choose / expand payment button */}
                      <Button
                        onClick={() => {
                          if (isCurrentPlan) return;
                          setExpandedPlan(isExpanded ? null : plan.id);
                        }}
                        disabled={isCurrentPlan || subscribing === plan.id}
                        className={`btn-press w-full rounded-xl h-11 font-semibold transition-all duration-300 text-white ${
                          isCurrentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isExpanded
                            ? 'bg-gray-800 hover:bg-gray-900'
                            : btnBg
                        }`}
                      >
                        {isCurrentPlan ? 'Plan actuel' : subscribing === plan.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Activation...
                          </span>
                        ) : isExpanded ? (
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

                      {/* Inline payment section */}
                      {isExpanded && !isCurrentPlan && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <PaymentBlock
                            amount={plan.price}
                            label={`Abonnement ${plan.name}`}
                            color={cardColor}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Section>
        )}

        {/* ============ POINTS TAB ============ */}
        {activeTab === 'points' && (
          <Section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Achetez des points</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Les points vous permettent de débloquer les coordonnées des acheteurs intéressés par vos annonces. 1 500 points = 1 contact débloqué.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {POINT_PACKAGES.map((pkg) => {
                const isExpanded = expandedPkg === pkg.id;
                return (
                  <Card
                    key={pkg.id}
                    className={`relative rounded-2xl border-2 transition-all duration-500 ease-out hover:-translate-y-1 ${
                      pkg.popular
                        ? 'border-orange shadow-xl shadow-orange/10'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-3">
                        Meilleur rapport
                      </Badge>
                    )}
                    <CardContent className="pt-8 pb-6 space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Coins className="w-8 h-8 text-orange" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                          {pkg.points.toLocaleString('fr-FR')}
                        </p>
                        <p className="text-orange font-semibold text-sm">points</p>
                      </div>

                      <div className="bg-orange-bg rounded-xl py-3 px-4 text-center">
                        <span className="text-2xl font-bold text-gray-900">{pkg.price.toLocaleString('fr-FR')}</span>
                        <span className="text-gray-500 text-sm"> FCFA</span>
                      </div>

                      <div className="text-xs text-gray-400 text-center">
                        ≈ {Math.round(pkg.points / 1500)} contacts débloqués
                      </div>

                      {/* Buy / expand button */}
                      <Button
                        onClick={() => setExpandedPkg(isExpanded ? null : pkg.id)}
                        className={`btn-press w-full rounded-xl h-11 font-semibold transition-all duration-300 ${
                          isExpanded
                            ? 'bg-gray-800 hover:bg-gray-900 text-white'
                            : pkg.popular
                            ? 'bg-orange hover:bg-orange-dark text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                      >
                        {isExpanded ? (
                          <span className="flex items-center gap-2">
                            <ChevronUp className="w-4 h-4" />
                            Masquer le paiement
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Acheter {pkg.points.toLocaleString('fr-FR')} pts
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        )}
                      </Button>

                      {/* Inline payment section */}
                      {isExpanded && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <PaymentBlock
                            amount={pkg.price}
                            label={`Pack ${pkg.label} — ${pkg.points.toLocaleString('fr-FR')} points`}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* How it works */}
            <div className="mt-10 max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-gray-900 text-center">Comment ça marche ?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Coins className="w-5 h-5 text-orange" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Achetez des points</p>
                  <p className="text-xs text-gray-500 mt-1">Envoyez au {PAYMENT_PHONE} via Wave ou Orange Money</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Débloquez les contacts</p>
                  <p className="text-xs text-gray-500 mt-1">1 500 points = 1 numéro de téléphone débloqué</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Contactez le vendeur</p>
                  <p className="text-xs text-gray-500 mt-1">Appelez ou envoyez un WhatsApp directement</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* FAQ */}
        <Section className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:bg-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                C&apos;est gratuit pour les acheteurs ?
              </h3>
              <p className="text-sm text-gray-600">
                Oui ! Poster une annonce &quot;Je cherche&quot; est 100% gratuit. Ce sont les vendeurs qui paient en points pour débloquer vos coordonnées. Les abonnements BOLT ⚡, DIAMBAR 💪🏽 et VIP KING 👑 sont destinés aux vendeurs qui souhaitent publier des annonces &quot;Je vends&quot; et être plus visibles.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:bg-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                Comment puis-je payer ?
              </h3>
              <p className="text-sm text-gray-600">
                Nous acceptons Wave et Orange Money. Envoyez le montant au <strong>{PAYMENT_PHONE}</strong>, puis envoyez la capture d&apos;écran sur <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">WhatsApp</a>. L&apos;activation est immédiate après confirmation.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:bg-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                Puis-je changer de plan ?
              </h3>
              <p className="text-sm text-gray-600">
                Oui, vous pouvez upgrader à tout moment. Le nouveau plan sera actif immédiatement et les points seront ajoutés à votre solde actuel.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:bg-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                Les points expirent-ils ?
              </h3>
              <p className="text-sm text-gray-600">
                Non, vos points n&apos;expirent jamais. Ils restent sur votre compte jusqu&apos;à ce que vous les utilisiez pour débloquer des contacts.
              </p>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
