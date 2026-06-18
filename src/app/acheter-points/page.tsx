'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins, Check, Award, ChevronDown, ChevronUp,
  CreditCard, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { getPointsPaymentUrl } from '@/lib/constants';
import { createPendingPayment } from '@/lib/payment-pending-client';

const POINT_PACKAGES = [
  { id: 'starter', amountFcfa: 1300, points: 7000, label: 'Starter', popular: false },
  { id: 'standard', amountFcfa: 2500, points: 17000, label: 'Standard', popular: true },
  { id: 'premium', amountFcfa: 5000, points: 50000, label: 'Premium', popular: false },
  { id: 'ultimate', amountFcfa: 10000, points: 105000, label: 'Ultimate', popular: false },
];

// Payment block — direct checkout link
function PkgPaymentBlock({ pkg }: { pkg: typeof POINT_PACKAGES[0] }) {
  const paymentUrl = getPointsPaymentUrl(pkg.id);
  const [isPreparing, setIsPreparing] = useState(false);

  async function handlePayClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setIsPreparing(true);
    const result = await createPendingPayment({
      planId: pkg.id,
      amount: pkg.amountFcfa,
      type: 'points',
    });
    window.location.href = result.paymentUrl;
  }

  return (
    <div className="space-y-3">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Pack</span>
          <span className="font-medium text-gray-900">{pkg.label}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Points</span>
          <span className="font-medium text-orange">+{pkg.points.toLocaleString('fr-FR')}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-medium text-gray-700 text-xs">Total à payer</span>
          <span className="text-lg font-bold text-gray-900">{pkg.amountFcfa.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Direct payment button */}
      <a href={paymentUrl} target="_blank" rel="noopener noreferrer" onClick={handlePayClick} className="block">
        <Button
          className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-sm"
          type="button"
          disabled={isPreparing}
        >
          {isPreparing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Préparation...
            </span>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Payer maintenant
            </>
          )}
        </Button>
      </a>

      <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-green-800">
          Paiement sécurisé via Wave. Vos points sont crédités automatiquement après confirmation du paiement.
        </p>
      </div>
    </div>
  );
}

export default function AcheterPointsPage() {
  const router = useRouter();
  const { user, isLoading, loadFromStorage } = useAuth();
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    // ⚠️ NE PAS rediriger tant que isLoading est true — sinon on boucle
    // entre /acheter-points et /login car user est null au premier render
    // (état initial Zustand) avant que loadFromStorage() ne le peuple.
    if (!isLoading && !user) {
      router.push('/login?redirect=/acheter-points');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-bg rounded-lg flex items-center justify-center mx-auto mb-3">
            <Coins className="w-6 h-6 text-orange" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold heading-compact text-gray-900">
            Acheter des points
          </h1>
          <p className="text-gray-500 text-xs mt-1 max-w-xl mx-auto">
            Rechargez votre solde de points pour débloquer les coordonnées des ACHETEURS et faire des affaires sur Wakhma Store
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-orange/10 text-orange font-semibold px-3 py-1.5 rounded-full text-xs">
            <Award className="w-5 h-5" />
            Votre solde : {user.points.toLocaleString('fr-FR')} points
          </div>
        </div>

        {/* Point Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POINT_PACKAGES.map((pkg) => {
            const isExpanded = expandedPkg === pkg.id;
            return (
              <Card
                key={pkg.id}
                className={`relative rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                  isExpanded
                    ? 'border-2 border-orange shadow-lg scale-[1.02]'
                    : 'border border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => !isExpanded && setExpandedPkg(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-2.5">
                    Populaire
                  </Badge>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="text-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                      isExpanded ? 'bg-orange/10' : 'bg-gray-100'
                    }`}>
                      <Coins className={`w-5 h-5 ${isExpanded ? 'text-orange' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm heading-compact">{pkg.label}</h3>
                    <p className="text-2xl font-extrabold text-orange mt-1">
                      {pkg.points.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>

                  <div className="bg-orange-bg rounded-xl py-2.5 px-4 text-center">
                    <span className="text-lg font-bold text-gray-900">{pkg.amountFcfa.toLocaleString('fr-FR')}</span>
                    <span className="text-sm font-normal text-gray-500"> FCFA</span>
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    ≈ {Math.round(pkg.points / 1500)} contacts débloqués
                  </div>

                  {/* Buy / expand button */}
                  <Button
                    className={`w-full rounded-xl h-10 text-xs font-semibold ${
                      isExpanded
                        ? 'bg-gray-800 hover:bg-gray-900 text-white'
                        : 'bg-orange hover:bg-orange-dark text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPkg(isExpanded ? null : pkg.id);
                    }}
                  >
                    {isExpanded ? (
                      <span className="flex items-center gap-2">
                        <ChevronUp className="w-4 h-4" />
                        Masquer
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Acheter
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  {/* Inline payment */}
                  {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" onClick={(e) => e.stopPropagation()}>
                      <PkgPaymentBlock pkg={pkg} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
