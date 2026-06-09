'use client';

import { Coins, Crown, ArrowRight, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RechargePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl font-bold heading-compact text-gray-900">
            Rechargez votre compte
          </h1>
          <p className="text-gray-500 text-xs mt-1 max-w-xl mx-auto">
            Achetez des points ou souscrivez un abonnement pour maximiser votre expérience sur Wakhma Store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buy Points Card */}
          <Card className="rounded-lg border-2 border-orange hover:shadow-lg transition-all">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-orange" />
              </div>
              <h2 className="text-sm font-bold heading-compact text-gray-900 mb-2">
                Acheter des points
              </h2>
              <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                Rechargez votre solde de points pour débloquer les coordonnées des vendeurs
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6 space-y-2 text-left">
                <p className="text-sm font-medium text-gray-700 text-center mb-2">Nos packs</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Starter</span>
                  <span className="font-semibold">1 300 F → 7 000 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Standard</span>
                  <span className="font-semibold">2 500 F → 17 000 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Premium</span>
                  <span className="font-semibold">5 000 F → 50 000 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ultimate</span>
                  <span className="font-semibold">10 000 F → 105 000 pts</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4 justify-center">
                <Smartphone className="w-4 h-4 text-orange" />
                <Wallet className="w-4 h-4 text-blue-600" />
                <Building2 className="w-4 h-4 text-gray-500" />
              </div>

              <Link href="/acheter-points">
                <Button className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg h-10 px-8 text-sm w-full">
                  Acheter des points
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subscriptions Card */}
          <Card className="rounded-lg border-2 border-gray-900 hover:shadow-lg transition-all">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-sm font-bold heading-compact text-gray-900 mb-2">
                Abonnements
              </h2>
              <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                Économisez sur le débloquage des annonces avec un abonnement mensuel
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6 space-y-3 text-left">
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-semibold text-blue-600 text-sm">Diambar - 2 000 F/mois</p>
                  <p className="text-xs text-gray-500">Débloque à 1 000 pts (-33%)</p>
                </div>
                <div className="p-3 bg-orange/5 rounded-lg border border-orange/20">
                  <p className="font-semibold text-orange text-sm">VIP KING - 5 000 F/mois</p>
                  <p className="text-xs text-gray-500">Débloque à 800 pts (-47%)</p>
                </div>
              </div>

              <Link href="/abonnements">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg h-10 px-8 text-sm w-full">
                  Voir les abonnements
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500 mb-3">Méthodes de paiement acceptées</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Wallet className="w-4 h-4 text-blue-600" />
              Wave
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Smartphone className="w-4 h-4 text-orange" />
              Orange Money
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Building2 className="w-4 h-4 text-gray-500" />
              Virement
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
