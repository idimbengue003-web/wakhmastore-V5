'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gift, Copy, Users, ArrowLeft, CheckCircle, TrendingUp,
  Share2, Award, Star, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  points: number;
  totalReferralPoints: number;
  remainingPoints: number;
  canEarnMore: boolean;
  currentReferralCount: number;
  maxReferrals: number;
  pointsPerReferral: number;
  maxReferralPoints: number;
  referrals: {
    id: string;
    points: number;
    createdAt: string;
    referredName: string;
  }[];
}

export default function ParrainagePage() {
  const router = useRouter();
  const { user, token, isLoading, loadFromStorage } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (token) {
      fetchStats();
    }
  }, [token, isLoading]);

  async function fetchStats() {
    try {
      const res = await fetch('/api/referral', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }

  async function copyCode() {
    if (!stats?.referralCode) return;

    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      toast({
        title: 'Code copié !',
        description: 'Partagez ce code avec vos amis pour gagner des points.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = stats.referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function shareCode() {
    if (!stats?.referralCode) return;

    const shareText = `Rejoins Wakhma Store avec mon code de parrainage : ${stats.referralCode} et trouve les meilleures affaires à Dakar ! 🎉`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wakhma Store - Parrainage',
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Texte copié !',
        description: 'Collez-le dans un message pour partager votre code.',
      });
    }
  }

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const progressPercentage = stats
    ? Math.min(100, (stats.totalReferralPoints / stats.maxReferralPoints) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-orange -ml-2"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-orange" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Programme de parrainage
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Invite tes amis sur Wakhma Store et gagne <strong className="text-orange">400 points</strong> par filleul, jusqu&apos;à <strong className="text-orange">30 000 points</strong> !
          </p>
        </div>

        {/* Referral Code Card */}
        <Card className="border-2 border-orange/20 rounded-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange to-orange-dark p-6 text-center">
            <p className="text-white/80 text-sm font-medium mb-2">Ton code de parrainage</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider font-mono">
              {stats?.referralCode || '...'}
            </p>
            <div className="flex gap-3 mt-4 justify-center">
              <Button
                onClick={copyCode}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl"
              >
                {copied ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Copié !</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copier</>
                )}
              </Button>
              <Button
                onClick={shareCode}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" /> Partager
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{stats?.points || 0}</p>
              <p className="text-xs text-gray-500">Points totaux</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{stats?.currentReferralCount || 0}</p>
              <p className="text-xs text-gray-500">Filleuls</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{stats?.totalReferralPoints || 0}</p>
              <p className="text-xs text-gray-500">Points gagnés</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{stats?.remainingPoints || 0}</p>
              <p className="text-xs text-gray-500">Points restants</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="rounded-2xl border-gray-100 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Progression vers la limite</h3>
              <Badge className={stats?.canEarnMore ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-500 border-0'}>
                {stats?.canEarnMore ? 'Actif' : 'Limite atteinte'}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats?.totalReferralPoints || 0} points gagnés</span>
              <span>{stats?.maxReferralPoints || 30000} points max</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats?.canEarnMore
                ? `${Math.floor((stats.remainingPoints) / 400)} filleuls restants pour atteindre la limite`
                : 'Tu as atteint la limite de points de parrainage ! Merci pour ton soutien.'}
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="rounded-2xl border-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange" />
              Comment ça marche ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Partage ton code</p>
                <p className="text-sm text-gray-500">Envoie ton code de parrainage unique à tes amis par WhatsApp, SMS ou réseaux sociaux.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ton ami s&apos;inscrit</p>
                <p className="text-sm text-gray-500">Ton ami crée un compte sur Wakhma Store en utilisant ton code de parrainage.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Tu gagnes 400 points</p>
                <p className="text-sm text-gray-500">Dès que ton ami valide son inscription, tu reçois automatiquement 400 points. Tu peux gagner jusqu&apos;à 30 000 points au total !</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        {stats?.referrals && stats.referrals.length > 0 && (
          <Card className="rounded-2xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange" />
                Historique des filleuls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{referral.referredName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(referral.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 font-semibold">
                      +{referral.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
