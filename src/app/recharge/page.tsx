'use client';

import { useState, useEffect } from 'react';
import { Check, Crown, Star, Zap, Coins, Sparkles, ShieldCheck, ArrowRight, Phone, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { PLANS, POINT_PACKAGES } from '@/lib/constants';
import type { PlanId } from '@/lib/constants';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>;
}

const PAYMENT_PHONE = '78 927 12 96';
const WHATSAPP_LINK = 'https://wa.me/221789271296';

export default function RechargePage() {
  const { user, token, loadFromStorage } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'plans' | 'points'>('plans');
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  async function handleSubscribe(planId: PlanId) {
    if (!token) {
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Plan activé !',
          description: data.message || `Plan ${PLANS[planId].name} activé avec succès`,
        });
        // Update local user
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('wakhma_user');
          if (stored) {
            const u = JSON.parse(stored);
            u.plan = planId;
            u.points = data.points || u.points;
            localStorage.setItem('wakhma_user', JSON.stringify(u));
          }
        }
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

  async function handleBuyPoints(packageId: string) {
    if (!token) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour acheter des points', variant: 'destructive' });
      return;
    }
    setPurchasing(packageId);
    try {
      const res = await fetch('/api/purchase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Points ajoutés !',
          description: `${data.pointsAdded?.toLocaleString('fr-FR') || ''} points ajoutés à votre compte`,
        });
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('wakhma_user');
          if (stored) {
            const u = JSON.parse(stored);
            u.points = data.newBalance || u.points;
            localStorage.setItem('wakhma_user', JSON.stringify(u));
          }
        }
        window.location.reload();
      } else {
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de l\'achat', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setPurchasing(null);
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
                return (
                  <Card
                    key={plan.id}
                    className={`relative rounded-2xl border-2 transition-all duration-500 ease-out hover:-translate-y-1 ${
                      isPopular
                        ? 'border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]'
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
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <>
                          <span className="text-4xl font-extrabold text-gray-900">
                            {plan.price.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-gray-500 text-sm"> FCFA{plan.period}</span>
                        </>
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

                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className={`w-5 h-5 flex-shrink-0 ${
                                isPopular ? 'text-amber-500' : plan.id === 'diambar' ? 'text-green-500' : 'text-blue-500'
                              }`}
                            />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrentPlan || subscribing === plan.id}
                        className={`btn-press w-full rounded-xl h-11 font-semibold transition-all duration-300 text-white ${
                          isCurrentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isPopular
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : plan.id === 'diambar'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {isCurrentPlan ? 'Plan actuel' : subscribing === plan.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Activation...
                          </span>
                        ) : `Choisir ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Payment Info */}
            <Section className="mt-8">
              <div className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Comment payer ?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Envoyez le montant via <strong>Wave</strong> ou <strong>Orange Money</strong> au numéro ci-dessous, puis envoyez la capture d&apos;écran sur WhatsApp pour validation.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-700 border-0">Wave</Badge>
                      <Badge className="bg-orange/20 text-orange border-0">Orange Money</Badge>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-200">
                      <div>
                        <p className="text-[10px] text-gray-500">Numéro Wave / Orange Money</p>
                        <p className="text-lg font-bold text-gray-900">{PAYMENT_PHONE}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-9 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(PAYMENT_PHONE.replace(/\s/g, ''));
                            toast({ title: 'Copié !', description: 'Numéro copié dans le presse-papier' });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-9 px-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
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
              {user && (
                <div className="inline-flex items-center gap-2 bg-orange/10 text-orange px-4 py-2 rounded-full text-sm font-semibold mt-3">
                  <Coins className="w-4 h-4" />
                  Solde : {user.points.toLocaleString('fr-FR')} points
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {POINT_PACKAGES.map((pkg) => (
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
                  <CardContent className="pt-8 pb-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Coins className="w-8 h-8 text-orange" />
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        {pkg.points.toLocaleString('fr-FR')}
                      </p>
                      <p className="text-orange font-semibold text-sm">points</p>
                    </div>
                    <div className="bg-orange-bg rounded-xl py-3 px-4">
                      <span className="text-2xl font-bold text-gray-900">{pkg.price.toLocaleString('fr-FR')}</span>
                      <span className="text-gray-500 text-sm"> FCFA</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      ≈ {Math.round(pkg.points / 1500)} contacts débloqués
                    </div>
                    <Button
                      onClick={() => handleBuyPoints(pkg.id)}
                      disabled={purchasing === pkg.id}
                      className={`btn-press w-full rounded-xl h-11 font-semibold transition-all duration-300 ${
                        pkg.popular
                          ? 'bg-orange hover:bg-orange-dark text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {purchasing === pkg.id ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Traitement...
                        </span>
                      ) : (
                        <>
                          Acheter {pkg.points.toLocaleString('fr-FR')} pts
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Info for Points */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">Paiement des points</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Envoyez le montant via <strong>Wave</strong> ou <strong>Orange Money</strong> au numéro ci-dessous, puis envoyez la capture sur WhatsApp.
                    </p>
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-green-200">
                      <div>
                        <p className="text-[10px] text-gray-500">Numéro</p>
                        <p className="text-base font-bold text-gray-900">{PAYMENT_PHONE}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 h-8 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(PAYMENT_PHONE.replace(/\s/g, ''));
                            toast({ title: 'Copié !', description: 'Numéro copié' });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 h-8 px-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Points FAQ */}
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
