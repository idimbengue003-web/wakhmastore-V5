'use client';

import { Check, Crown, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const plans = [
  {
    name: 'Gratuit',
    icon: Zap,
    price: '0',
    period: '/mois',
    description: 'Pour découvrir Wakhma Store',
    features: [
      '3 annonces par mois',
      'Visibilité standard',
      'Support par email',
    ],
    color: 'gray',
    buttonText: 'Plan actuel',
    buttonVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Diambar',
    icon: Star,
    price: '2 000',
    period: '/mois',
    description: 'Pour les vendeurs actifs',
    features: [
      '15 annonces par mois',
      'Badge ⭐ Diambar',
      'Annonces mises en avant',
      'Support prioritaire WhatsApp',
    ],
    color: 'blue',
    buttonText: 'Choisir Diambar',
    buttonVariant: 'default' as const,
    popular: false,
  },
  {
    name: 'VIP KING',
    icon: Crown,
    price: '5 000',
    period: '/mois',
    description: 'Pour les pros de la vente',
    features: [
      'Annonces illimitées',
      'Badge ⭐ VIP KING',
      'Annonces en tête de liste',
      'Support prioritaire WhatsApp',
      'Statistiques détaillées',
      'Mise en avant hebdomadaire',
    ],
    color: 'orange',
    buttonText: 'Choisir VIP KING',
    buttonVariant: 'default' as const,
    popular: true,
  },
];

export default function RechargePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Rechargez votre compte
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Choisissez le plan qui correspond à vos besoins et boostez vos annonces sur Wakhma Store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative rounded-2xl border-2 transition-all ${
                  plan.popular
                    ? 'border-orange shadow-lg scale-[1.02]'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white border-0 font-semibold px-4">
                    Le plus populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                      plan.popular ? 'bg-orange/10' : 'bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${plan.popular ? 'text-orange' : 'text-gray-500'}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-sm"> FCFA{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 ${
                            plan.popular ? 'text-orange' : 'text-green-500'
                          }`}
                        />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full rounded-xl h-11 font-semibold ${
                        plan.popular
                          ? 'bg-orange hover:bg-orange-dark text-white'
                          : plan.buttonVariant === 'outline'
                          ? 'border-gray-200 text-gray-500'
                          : ''
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">
                Comment puis-je payer ?
              </h3>
              <p className="text-sm text-gray-600">
                Nous acceptons Wave, Orange Money et les transferts bancaires. Contactez-nous sur WhatsApp pour finaliser votre paiement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">
                Puis-je changer de plan ?
              </h3>
              <p className="text-sm text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le nouveau plan sera actif immédiatement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">
                Y a-t-il une période d&apos;essai ?
              </h3>
              <p className="text-sm text-gray-600">
                Le plan Gratuit vous permet de tester la plateforme. Vous pouvez upgrader quand vous êtes prêt.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
