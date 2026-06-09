'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins, CreditCard, Check, Loader2, Award, AlertCircle,
  Smartphone, Building2, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const POINT_PACKAGES = [
  { id: 'starter', amountFcfa: 1300, points: 7000, label: 'Starter', popular: false },
  { id: 'standard', amountFcfa: 2500, points: 17000, label: 'Standard', popular: true },
  { id: 'premium', amountFcfa: 5000, points: 50000, label: 'Premium', popular: false },
  { id: 'ultimate', amountFcfa: 10000, points: 105000, label: 'Ultimate', popular: false },
];

const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', icon: Wallet, color: 'text-blue-600' },
  { id: 'orange_money', label: 'Orange Money', icon: Smartphone, color: 'text-orange-500' },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: Building2, color: 'text-gray-600' },
];

export default function AcheterPointsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, loadFromStorage, login } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
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

  async function handlePurchase() {
    if (!selectedPackage || !selectedPayment || !token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          paymentMethod: selectedPayment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update user points in auth store
        if (user) {
          const updatedUser = { ...user, points: data.newBalance };
          login(token, updatedUser);
        }

        toast({
          title: 'Achat réussi !',
          description: data.message,
        });

        setSelectedPackage(null);
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'achat',
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

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-orange" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Acheter des points
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Rechargez votre compte pour débloquer les coordonnées des vendeurs et faire des affaires sur Wakhma Store
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-orange/10 text-orange font-semibold px-4 py-2 rounded-full">
            <Award className="w-5 h-5" />
            Votre solde : {user.points.toLocaleString('fr-FR')} points
          </div>
        </div>

        {/* Point Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {POINT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage === pkg.id
                  ? 'border-2 border-orange shadow-lg scale-[1.02]'
                  : 'border border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-3">
                  Populaire
                </Badge>
              )}
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  selectedPackage === pkg.id ? 'bg-orange/10' : 'bg-gray-100'
                }`}>
                  <Coins className={`w-6 h-6 ${selectedPackage === pkg.id ? 'text-orange' : 'text-gray-400'}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{pkg.label}</h3>
                <p className="text-3xl font-extrabold text-orange mt-2">
                  {pkg.points.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500 mb-3">points</p>
                <Separator className="my-3" />
                <p className="text-xl font-bold text-gray-900">
                  {pkg.amountFcfa.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-500">FCFA</span>
                </p>
                {selectedPackage === pkg.id && (
                  <div className="mt-3">
                    <Check className="w-6 h-6 text-orange mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Method & Purchase */}
        {selectedPackage && (
          <Card className="border-gray-100 rounded-2xl max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange" />
                Méthode de paiement
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
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
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

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pack</span>
                  <span className="font-medium text-gray-900">
                    {POINT_PACKAGES.find(p => p.id === selectedPackage)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Points</span>
                  <span className="font-medium text-orange">
                    +{POINT_PACKAGES.find(p => p.id === selectedPackage)?.points.toLocaleString('fr-FR')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {POINT_PACKAGES.find(p => p.id === selectedPackage)?.amountFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Le paiement est simulé en mode démo. En production, vous seriez redirigé vers {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label} pour finaliser.
                </p>
              </div>

              <Button
                className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base"
                disabled={loading}
                onClick={handlePurchase}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Acheter {POINT_PACKAGES.find(p => p.id === selectedPackage)?.points.toLocaleString('fr-FR')} points
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
