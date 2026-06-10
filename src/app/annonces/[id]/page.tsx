'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, Clock, Phone, MessageCircle, Lock,
  Shield, Star, Loader2, CheckCircle, AlertCircle, User,
  Eye, Wallet, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AnnonceDetail {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  location: string;
  emoji: string;
  isVip: boolean;
  vipType: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  phone: string | null;
  whatsapp: string | null;
  hasAccess: boolean;
  unlockCost: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString('fr-FR');
}

export default function AnnonceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token, isLoading, loadFromStorage } = useAuth();
  const { toast } = useToast();
  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0); // 0: loading, 1: card appear, 2: details appear, 3: paywall appear, 4: contact revealed
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      fetchAnnonce();
    }
  }, [isLoading, token]);

  async function fetchAnnonce() {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/annonces/${params.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAnnonce(data);

        // Start the slow-reveal animation sequence
        setTimeout(() => setRevealPhase(1), 100);  // Card appears
        setTimeout(() => setRevealPhase(2), 600);  // Details appear
        setTimeout(() => {
          if (data.hasAccess) {
            setRevealPhase(4); // Already purchased - show contact
          } else {
            setRevealPhase(3); // Show paywall option
          }
        }, 1200); // Paywall/contact appear
      } else {
        toast({
          title: 'Erreur',
          description: 'Annonce non trouvée',
          variant: 'destructive',
        });
        router.push('/annonces');
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!token || !user) {
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour débloquer les coordonnées',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch(`/api/annonces/${params.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Update the annonce state with contact info
        setAnnonce(prev => prev ? {
          ...prev,
          phone: data.phone,
          whatsapp: data.whatsapp,
          hasAccess: true,
        } : prev);

        setShowPaywallModal(false);

        // Smooth reveal animation for contact info
        setTimeout(() => setRevealPhase(4), 100);

        toast({
          title: 'Accès débloqué !',
          description: `${data.pointsDeducted} points déduits. Il vous reste ${data.remainingPoints} points.`,
        });

        // Update user points in auth store
        if (user) {
          const updatedUser = { ...user, points: data.remainingPoints };
          localStorage.setItem('wakhma_user', JSON.stringify(updatedUser));
        }
      } else {
        if (res.status === 400 && data.missingPoints !== undefined) {
          toast({
            title: 'Points insuffisants',
            description: `Il vous manque ${data.missingPoints} points. Vous avez ${data.currentPoints} points sur ${data.requiredPoints} requis.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: data.error || 'Erreur lors du débloquage',
            variant: 'destructive',
          });
        }
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement de l&apos;annonce...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!annonce) return null;

  const isOwner = user && user.id === annonce.authorId;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-orange -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Annonce Card - Slow reveal */}
        <div className={`transition-all duration-700 ease-out ${revealPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="border-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {/* Emoji Header */}
            <div className="relative bg-gradient-to-br from-orange/10 to-orange/5">
              <div className="h-40 sm:h-48 flex items-center justify-center">
                <span className="text-7xl sm:text-8xl">{annonce.emoji}</span>
              </div>
              {/* VIP Badge */}
              {annonce.isVip && (
                <Badge className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-sm font-bold border-0 px-3 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  {annonce.vipType === 'vip_king' ? 'VIP KING' : 'DIAMBAR'}
                </Badge>
              )}
              {/* Category Badge */}
              <Badge
                variant="secondary"
                className="absolute top-4 left-4 bg-white/90 text-gray-700 font-medium backdrop-blur-sm"
              >
                {annonce.category}
              </Badge>
            </div>

            {/* Content - Slow reveal */}
            <CardContent className={`p-6 sm:p-8 transition-all duration-700 ease-out delay-200 ${revealPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Title & Price */}
              <div className="space-y-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {annonce.title}
                </h1>
                <p className="text-3xl sm:text-4xl font-extrabold text-orange">
                  {formatPrice(annonce.price)}
                </p>
              </div>

              {/* Location & Time */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange" />
                  {annonce.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange" />
                  {timeAgo(annonce.createdAt)}
                </span>
              </div>

              <Separator className="mb-6" />

              {/* Description */}
              {annonce.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {annonce.description}
                  </p>
                </div>
              )}

              {/* Author */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{annonce.authorName}</p>
                    <p className="text-xs text-gray-500">Vendeur sur Wakhma Store</p>
                  </div>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Contact Section - Paywall or Revealed */}
              <div className={`transition-all duration-700 ease-out ${revealPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {annonce.hasAccess ? (
                  /* Contact Revealed */
                  <div className={`transition-all duration-1000 ease-out ${revealPhase >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Coordonnées débloquées</span>
                      </div>

                      {annonce.phone && (
                        <a
                          href={`tel:${annonce.phone}`}
                          className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Téléphone</p>
                            <p className="font-bold text-gray-900 text-lg">{annonce.phone}</p>
                          </div>
                        </a>
                      )}

                      {annonce.whatsapp && (
                        <a
                          href={`https://wa.me/${annonce.whatsapp.replace(/^(\+221|0)/, '221')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">WhatsApp</p>
                            <p className="font-bold text-gray-900 text-lg">{annonce.whatsapp}</p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Paywall */
                  <div className="space-y-4">
                    {isOwner ? (
                      /* Owner view */
                      <div className="bg-orange/5 border border-orange/20 rounded-2xl p-5">
                        <p className="text-sm text-gray-600">
                          <Eye className="w-4 h-4 inline mr-1.5 text-orange" />
                          C&apos;est votre annonce. Les autres utilisateurs paient <strong>1 500 points</strong> pour voir vos coordonnées.
                        </p>
                        {annonce.phone && (
                          <p className="mt-2 text-sm text-gray-500">Téléphone : {annonce.phone}</p>
                        )}
                        {annonce.whatsapp && (
                          <p className="text-sm text-gray-500">WhatsApp : {annonce.whatsapp}</p>
                        )}
                      </div>
                    ) : (
                      /* Locked paywall for non-owners */
                      <div className="bg-gradient-to-br from-gray-50 to-orange/5 border border-orange/20 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-orange" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Coordonnées verrouillées
                        </h3>
                        <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                          Dépensez <strong className="text-orange">1 500 points</strong> pour débloquer le numéro de téléphone et le lien WhatsApp du vendeur.
                        </p>

                        {!user ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500">
                              Connectez-vous pour débloquer les coordonnées
                            </p>
                            <Button
                              onClick={() => router.push('/login')}
                              className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 px-8"
                            >
                              Se connecter
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Wallet className="w-4 h-4 text-orange" />
                              <span className="text-gray-600">
                                Vous avez <strong className="text-orange">{user.points} points</strong>
                              </span>
                            </div>

                            <Button
                              onClick={handlePurchase}
                              disabled={purchasing || user.points < 1500}
                              className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12 px-8 text-base"
                            >
                              {purchasing ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Débloquage en cours...
                                </span>
                              ) : user.points < 1500 ? (
                                <span className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Points insuffisants ({user.points}/1500)
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Lock className="w-4 h-4" />
                                  Débloquer pour 1 500 points
                                </span>
                              )}
                            </Button>

                            {user.points < 1500 && (
                              <p className="text-xs text-gray-400">
                                Gagnez des points avec le{' '}
                                <a href="/parrainage" className="text-orange hover:underline font-medium">
                                  programme de parrainage
                                </a>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Security notice */}
              <div className={`mt-6 transition-all duration-700 ${revealPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Les coordonnées du vendeur sont protégées. Le paiement de 1 500 points garantit
                    un contact sérieux entre acheteurs et vendeurs sur Wakhma Store.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
