'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Phone, MessageCircle, Info } from 'lucide-react';
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
import { containsPhoneNumber } from '@/lib/validation';

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
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null);
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

  // Vérification en temps réel des numéros dans titre/description
  const checkPhoneInFields = (title: string, description: string) => {
    if (containsPhoneNumber(title)) {
      setPhoneWarning('Les numéros de téléphone ne sont pas autorisés dans le titre. Utilisez les champs Téléphone/WhatsApp ci-dessous.');
      return true;
    }
    if (description && containsPhoneNumber(description)) {
      setPhoneWarning('Les numéros de téléphone ne sont pas autorisés dans la description. Utilisez les champs Téléphone/WhatsApp ci-dessous.');
      return true;
    }
    setPhoneWarning(null);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.category) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    // Bloquer les numéros de téléphone dans titre/description
    if (checkPhoneInFields(form.title, form.description)) {
      toast({
        title: 'Numéro de téléphone détecté',
        description: phoneWarning || 'Les numéros de téléphone ne sont pas autorisés dans le titre ou la description. Utilisez les champs Téléphone/WhatsApp prévus à cet effet.',
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
          isVip: false,
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

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-orange -ml-2 text-xs"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="border-gray-100 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold heading-compact text-gray-900">
              Déposer une annonce
            </CardTitle>
            <p className="text-gray-500 text-xs">
              Publiez gratuitement ce que vous cherchez. Les vendeurs vous contacteront !
            </p>
            {/* Free posting notice */}
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-2.5 mt-2">
              <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                <strong>C&apos;est gratuit !</strong> Sur Wakhma Store, c&apos;est le vendeur qui paye pour voir vos coordonnées.
                Vous postez votre demande gratuitement et les vendeurs intéressés débloquent votre contact pour 1 500 points.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-gray-700 text-xs">
                  Titre de l&apos;annonce *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Je cherche un iPhone 15 Pro Max"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    checkPhoneInFields(e.target.value, form.description);
                  }}
                  className={`rounded-lg border-gray-200 h-10 ${containsPhoneNumber(form.title) ? 'border-red-400 focus:border-red-500' : ''}`}
                  maxLength={100}
                />
                {containsPhoneNumber(form.title) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Numéro de téléphone détecté — utilisez les champs Téléphone/WhatsApp ci-dessous
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium text-gray-700 text-xs">
                  Catégorie *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200 h-10">
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
                <Label htmlFor="price" className="font-medium text-gray-700 text-xs">
                  Prix maximum (FCFA) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 150000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-lg border-gray-200 h-10"
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium text-gray-700 text-xs">
                  Localisation
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Dakar, Mermoz, Almadies"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-lg border-gray-200 h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-gray-700 text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce que vous cherchez en détail..."
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    checkPhoneInFields(form.title, e.target.value);
                  }}
                  className={`rounded-lg border-gray-200 min-h-20 ${form.description && containsPhoneNumber(form.description) ? 'border-red-400 focus:border-red-500' : ''}`}
                  rows={4}
                  maxLength={1000}
                />
                {form.description && containsPhoneNumber(form.description) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Numéro de téléphone détecté — utilisez les champs Téléphone/WhatsApp ci-dessous
                  </p>
                )}
              </div>

              {/* Contact Info Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm heading-compact flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange" />
                  Coordonnées de contact
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Ces informations seront visibles uniquement par les vendeurs qui paient 1 500 points pour débloquer votre contact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-gray-700 text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-lg border-gray-200 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="font-medium text-gray-700 text-xs flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      className="rounded-lg border-gray-200 h-10"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Format : numéro sénégalais (ex: 771234567 ou +221771234567)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg h-10 text-sm"
                disabled={submitting}
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
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
