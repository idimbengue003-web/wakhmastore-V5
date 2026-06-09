'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins, Check, Award, AlertCircle,
  Smartphone, Wallet, MessageCircle, Send, Copy
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

const POINT_PACKAGES = [
  { id: 'starter', amountFcfa: 1300, points: 7000, label: 'Starter', popular: false },
  { id: 'standard', amountFcfa: 2500, points: 17000, label: 'Standard', popular: true },
  { id: 'premium', amountFcfa: 5000, points: 50000, label: 'Premium', popular: false },
  { id: 'ultimate', amountFcfa: 10000, points: 105000, label: 'Ultimate', popular: false },
];

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

export default function AcheterPointsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, loadFromStorage } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('wave');
  const [proofRef, setProofRef] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  function getWhatsAppLink() {
    const pkg = POINT_PACKAGES.find(p => p.id === selectedPackage);
    const method = PAYMENT_METHODS.find(m => m.id === selectedPayment);
    const message = `Bonjour Wakhma Store !\n\nJe souhaite acheter le pack *${pkg?.label}* (${pkg?.points.toLocaleString('fr-FR')} points - ${pkg?.amountFcfa.toLocaleString('fr-FR')} FCFA).\n\nMéthode de paiement : *${method?.label}*\nRéférence / ID transaction : ${proofRef || '(à compléter)'}\n\nMerci de confirmer la réception du paiement !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast({
      title: 'Copié !',
      description: 'Numéro copié dans le presse-papier',
    });
  }

  if (!user) return null;

  const selectedPkg = POINT_PACKAGES.find(p => p.id === selectedPackage);
  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {POINT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage === pkg.id
                  ? 'border-2 border-orange shadow-lg scale-[1.02]'
                  : 'border border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-2.5">
                  Populaire
                </Badge>
              )}
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                  selectedPackage === pkg.id ? 'bg-orange/10' : 'bg-gray-100'
                }`}>
                  <Coins className={`w-5 h-5 ${selectedPackage === pkg.id ? 'text-orange' : 'text-gray-400'}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm heading-compact">{pkg.label}</h3>
                <p className="text-2xl font-extrabold text-orange mt-1">
                  {pkg.points.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500 mb-3">points</p>
                <Separator className="my-3" />
                <p className="text-lg font-bold text-gray-900">
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

        {/* Payment Instructions */}
        {selectedPackage && (
          <Card className="border-gray-100 rounded-lg max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Instructions de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Choose method */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">1</span>
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
              </div>

              <Separator />

              {/* Step 2: Send payment */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">2</span>
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
                  <span className="text-gray-500">Pack</span>
                  <span className="font-medium text-gray-900">{selectedPkg?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Points</span>
                  <span className="font-medium text-orange">+{selectedPkg?.points.toLocaleString('fr-FR')}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant à envoyer</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedPkg?.amountFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <Separator />

              {/* Step 3: Reference */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-bold">3</span>
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
                  Après avoir envoyé le paiement, cliquez sur le bouton ci-dessous pour nous envoyer la preuve via WhatsApp. Votre solde sera crédité dès validation (sous 30 min).
                </p>
              </div>

              {/* Step 4: Send proof via WhatsApp */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-11 text-sm"
                  type="button"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Envoyer la preuve via WhatsApp
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
