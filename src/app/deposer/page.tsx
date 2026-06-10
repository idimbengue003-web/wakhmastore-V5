'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Phone, MessageCircle, Info, Crown, Star, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { PLANS } from '@/lib/constants';

const categoryEmojis: Record<string, string> = {
  'Téléphones': '📱',
  'TV & Écrans': '📺',
  'Frigo & Congélateur': '🧊',
  'Climatiseur & Ventilateur': '❄️',
  'Ordinateurs': '💻',
  'Tablettes': '📲',
  'Audio & Son': '🔊',
  'Électroménager': '🏠',
  'Plomberie': '🔧',
  'Électricité': '⚡',
  'Meubles': '🛋️',
  'Mode & Vetements': '👗',
  'Cosmétiques': '💄',
  'Alimentation': '🍜',
  'Services': '🤝',
  'Transport': '🚗',
  'Immobilier': '🏗️',
  'Autre': '📦',
};

const categoryNames = Object.keys(categoryEmojis);

export default function DeposerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isLoading, loadFromStorage } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [annonceCount, setAnnonceCount] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: 'Dakar',
    phone: '',
    whatsapp: '',
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !token) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour déposer une annonce.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [token, isLoading]);

  // Pre-fill phone from user profile
  useEffect(() => {
    if (user?.phone && !form.phone) {
      setForm(prev => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user]);

  // Fetch user's annonce count for plan limits
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.stats?.totalAnnonces !== undefined) {
            setAnnonceCount(data.stats.totalAnnonces);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const userPlan = user?.plan ? PLANS[user.plan as keyof typeof PLANS] || PLANS.gratuit : PLANS.gratuit;
  const maxAnnonces = userPlan.annoncesPerWeek > 0 ? userPlan.annoncesPerWeek : userPlan.annoncesPerMonth;
  const periodLabel = userPlan.annoncesPerWeek > 0 ? 'semaine' : 'mois';
  const isAtLimit = maxAnnonces > 0 && annonceCount !== null && annonceCount >= maxAnnonces;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAtLimit) {
      toast({
        title: 'Limite atteinte',
        description: `Vous avez atteint votre limite de ${maxAnnonces} annonces par ${periodLabel}. Passez à un plan supérieur !`,
        variant: 'destructive',
      });
      return;
    }

    if (!form.title || !form.price || !form.category) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/annonces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          emoji: categoryEmojis[form.category] || '📦',
        }),
      });

      if (res.ok) {
        toast({
          title: 'Annonce publiée !',
          description: 'Votre annonce a été créée avec succès. Elle est visible par tous les utilisateurs.',
        });
        router.push('/annonces');
      } else {
        const data = await res.json();
        if (res.status === 401) {
          toast({
            title: 'Session expirée',
            description: 'Veuillez vous reconnecter.',
            variant: 'destructive',
          });
          router.push('/login');
        } else if (res.status === 403) {
          toast({
            title: 'Limite atteinte',
            description: data.error || 'Limite d\'annonces atteinte pour votre plan',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: data.error || 'Erreur lors de la création',
            variant: 'destructive',
          });
        }
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-orange -ml-2 btn-press"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="border-gray-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Déposer une annonce
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Publiez gratuitement ce que vous cherchez. Les vendeurs vous contacteront !
            </p>

            {/* Free posting notice */}
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mt-2 transition-all duration-300 hover:bg-green-100">
              <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                <strong>C&apos;est gratuit !</strong> Sur Wakhma Store, c&apos;est le vendeur qui paye pour voir vos coordonnées.
                Vous postez votre demande gratuitement et les vendeurs intéressés débloquent votre contact pour 1 500 points.
              </p>
            </div>

            {/* Plan limit indicator */}
            <div className={`flex items-center justify-between gap-3 rounded-xl p-3 mt-2 transition-all duration-300 ${
              isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-orange-bg border border-orange/10'
            }`}>
              <div className="flex items-center gap-2">
                {user.plan === 'vip_king' ? (
                  <Crown className="w-4 h-4 text-orange" />
                ) : user.plan === 'diambar' ? (
                  <Star className="w-4 h-4 text-blue-500" />
                ) : (
                  <Zap className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs font-medium text-gray-700">
                  Plan {userPlan.name} — {maxAnnonces > 0 ? `${maxAnnonces} annonces par ${periodLabel}` : 'Annonces illimitées'}
                </span>
              </div>
              <span className={`text-xs font-bold ${isAtLimit ? 'text-red-600' : 'text-orange'}`}>
                {annonceCount !== null ? `${annonceCount}/${maxAnnonces > 0 ? maxAnnonces : '∞'}` : '...'}
              </span>
            </div>

            {/* Limit reached warning */}
            {isAtLimit && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-1 animate-in fade-in duration-300">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-700">
                  <p className="font-semibold mb-1">Limite atteinte !</p>
                  <p>Vous avez utilisé vos {maxAnnonces} annonces par {periodLabel}. </p>
                  <Link href="/recharge" className="font-bold text-red-600 underline hover:text-red-800">
                    Passez à un plan supérieur →
                  </Link>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-gray-700">
                  Titre de l&apos;annonce *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Je cherche un iPhone 15 Pro Max"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                  maxLength={100}
                  disabled={isAtLimit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium text-gray-700">
                  Catégorie *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                  disabled={isAtLimit}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 h-12">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryNames.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryEmojis[cat]} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-medium text-gray-700">
                  Prix maximum (FCFA) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 150000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                  min={0}
                  disabled={isAtLimit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium text-gray-700">
                  Localisation
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Dakar, Mermoz, Almadies"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                  disabled={isAtLimit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce que vous cherchez en détail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl border-gray-200 min-h-24 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                  rows={4}
                  maxLength={1000}
                  disabled={isAtLimit}
                />
              </div>

              {/* Contact Info Section */}
              <div className="border-t border-gray-100 pt-5 mt-5">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange" />
                  Coordonnées de contact
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Ces informations seront visibles uniquement par les vendeurs qui paient 1 500 points pour débloquer votre contact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-gray-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                      disabled={isAtLimit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="font-medium text-gray-700 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      className="rounded-xl border-gray-200 h-12 transition-all duration-300 focus:ring-2 focus:ring-orange/20"
                      disabled={isAtLimit}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Format : numéro sénégalais (ex: 771234567 ou +221771234567)
                </p>
              </div>

              <Button
                type="submit"
                className="btn-press w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 text-base transition-all duration-300"
                disabled={submitting || isAtLimit}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publication en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Publier gratuitement
                  </span>
                )}
              </Button>

              {isAtLimit && (
                <Link href="/recharge" className="block">
                  <Button type="button" className="btn-press w-full bg-gradient-to-r from-orange to-orange-dark text-white font-semibold rounded-xl h-12 text-base transition-all duration-300 mt-2">
                    <Crown className="w-5 h-5 mr-2" />
                    Passer à un plan supérieur
                  </Button>
                </Link>
              )}
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
