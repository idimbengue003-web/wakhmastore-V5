'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins, Check, Award, AlertCircle,
  Smartphone, Wallet, MessageCircle, Send, Copy,
  Phone, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PAYMENT_PHONE, WHATSAPP_LINK, WHATSAPP_NUMBER } from '@/lib/constants';

const POINT_PACKAGES = [
  { id: 'starter', amountFcfa: 1300, points: 7000, label: 'Starter', popular: false },
  { id: 'standard', amountFcfa: 2500, points: 17000, label: 'Standard', popular: true },
  { id: 'premium', amountFcfa: 5000, points: 50000, label: 'Premium', popular: false },
  { id: 'ultimate', amountFcfa: 10000, points: 105000, label: 'Ultimate', popular: false },
];

// Payment block for inline use
function PkgPaymentBlock({ pkg }: { pkg: typeof POINT_PACKAGES[0] }) {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<'wave' | 'orange_money'>('wave');
  const [proofRef, setProofRef] = useState('');

  function getWhatsAppLink() {
    const methodName = selectedPayment === 'wave' ? 'Wave' : 'Orange Money';
    const message = `Bonjour Wakhma Store !\n\nJe souhaite acheter le pack *${pkg.label}* (${pkg.points.toLocaleString('fr-FR')} points - ${pkg.amountFcfa.toLocaleString('fr-FR')} FCFA).\n\nMéthode : *${methodName}*\nRéférence : ${proofRef || '(à compléter)'}\n\nMerci de confirmer la réception !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="space-y-3">
      <Separator />

      {/* Payment methods */}
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">1</span>
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
        <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">2</span>
        Envoyez {pkg.amountFcfa.toLocaleString('fr-FR')} FCFA
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
        <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">3</span>
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
          <span className="text-gray-500">Pack</span>
          <span className="font-medium text-gray-900">{pkg.label}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Points</span>
          <span className="font-medium text-orange">+{pkg.points.toLocaleString('fr-FR')}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-medium text-gray-700 text-xs">Montant à envoyer</span>
          <span className="text-lg font-bold text-gray-900">{pkg.amountFcfa.toLocaleString('fr-FR')} FCFA</span>
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
          Vos points seront crédités sous 30 min après validation du paiement.
        </p>
      </div>
    </div>
  );
}

export default function AcheterPointsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loadFromStorage } = useAuth();
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/acheter-points');
    }
  }, [user, router]);

  if (!user) return null;

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
