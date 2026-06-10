'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, ArrowLeft, Package, ShoppingBag, TrendingUp, Award,
  Gift, Calendar, BarChart3, Eye, ChevronRight, Crown, Star, Zap,
  Loader2, Phone, Mail, Hash, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    plan: string;
    planLabel: string;
    points: number;
    referralCode: string;
    createdAt: string;
    _count: { annonces: number; referrals: number; purchases: number };
  };
  stats: {
    totalAnnonces: number;
    totalAnnoncesVendues: number;
    totalPurchasesReceived: number;
    totalRevenusPoints: number;
    totalValeurAnnonces: number;
    totalAchats: number;
    totalParrainages: number;
    totalPointsParrainage: number;
  };
  categoryStats: Record<string, { count: number; purchases: number }>;
  monthlyData: { month: string; annonces: number; ventes: number }[];
  mesAnnonces: {
    id: string; title: string; price: number; category: string;
    emoji: string; isVip: boolean; vipType: string | null; createdAt: string;
    _count: { purchases: number };
  }[];
  mesAchats: {
    id: string; points: number; createdAt: string;
    annonce: { id: string; title: string; price: number; emoji: string; category: string };
  }[];
  recentSales: {
    id: string; buyerName: string; annonceTitle: string;
    annonceEmoji: string; points: number; date: string;
  }[];
}

export default function ProfilPage() {
  const router = useRouter();
  const { token, loadFromStorage } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'annonces' | 'achats' | 'analytics'>('overview');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [token]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        toast({ title: 'Erreur', description: 'Impossible de charger le profil', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function formatPrice(price: number) {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  function getPlanBadge(plan: string) {
    if (plan === 'vip_king') return <Badge className="bg-amber-500 text-white gap-1"><Crown className="w-3 h-3" />VIP KING 👑</Badge>;
    if (plan === 'diambar') return <Badge className="bg-green-500 text-white gap-1"><Star className="w-3 h-3" />DIAMBAR 💪🏽</Badge>;
    if (plan === 'gratuit') return <Badge className="bg-blue-500 text-white gap-1"><Zap className="w-3 h-3" />BOLT ⚡</Badge>;
    return <Badge className="bg-gray-500 text-white gap-1">Sans abonnement</Badge>;
  }

  const maxMonthlyValue = profile?.monthlyData
    ? Math.max(...profile.monthlyData.map(m => Math.max(m.annonces, m.ventes)), 1)
    : 1;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Impossible de charger le profil</p>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, stats, categoryStats, monthlyData, mesAnnonces, mesAchats, recentSales } = profile;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" className="text-gray-600 hover:text-orange -ml-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="border-gray-100 rounded-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-dark to-orange h-24 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <User className="w-8 h-8 text-orange" />
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-4 px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{user.name || 'Utilisateur'}</h1>
                  {getPlanBadge(user.plan)}
                </div>
                <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Membre depuis {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/recharge" className="inline-flex">
                  <Button variant="outline" className="rounded-xl text-orange border-orange/30 hover:bg-orange-bg text-sm">
                    <Award className="w-4 h-4 mr-1.5" />
                    {user.points.toLocaleString('fr-FR')} pts
                  </Button>
                </Link>
                <Link href="/parrainage" className="inline-flex">
                  <Button variant="outline" className="rounded-xl text-green-600 border-green-300 hover:bg-green-50 text-sm">
                    <Gift className="w-4 h-4 mr-1.5" />
                    Parrainage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-orange mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnnonces}</p>
              <p className="text-xs text-gray-500">Annonces</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnnoncesVendues}</p>
              <p className="text-xs text-gray-500">Vendues</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <ShoppingBag className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalAchats}</p>
              <p className="text-xs text-gray-500">Achats</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-4 text-center">
              <Wallet className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenusPoints.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-gray-500">Pts gagnés</p>
            </CardContent>
          </Card>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { key: 'annonces', label: 'Mes annonces', icon: Package },
            { key: 'achats', label: 'Mes achats', icon: ShoppingBag },
            { key: 'analytics', label: 'Analytique', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeSection === key ? 'default' : 'outline'}
              className={`rounded-xl whitespace-nowrap text-sm ${activeSection === key ? 'bg-orange hover:bg-orange-dark text-white' : 'border-gray-200 text-gray-600 hover:text-orange'}`}
              onClick={() => setActiveSection(key as typeof activeSection)}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {label}
            </Button>
          ))}
        </div>

        {/* ============ OVERVIEW ============ */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales Chart (simple bar) */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange" />
                  Activité des 6 derniers mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {monthlyData.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-0.5 items-end w-full justify-center h-32">
                        <div
                          className="w-3 bg-orange/80 rounded-t-sm transition-all"
                          style={{ height: `${(m.annonces / maxMonthlyValue) * 100}%`, minHeight: m.annonces > 0 ? 4 : 0 }}
                          title={`${m.annonces} annonces`}
                        />
                        <div
                          className="w-3 bg-green-400 rounded-t-sm transition-all"
                          style={{ height: `${(m.ventes / maxMonthlyValue) * 100}%`, minHeight: m.ventes > 0 ? 4 : 0 }}
                          title={`${m.ventes} ventes`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-orange/80 rounded-sm" /> Annonces</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-green-400 rounded-sm" /> Ventes</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Dernières ventes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSales.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune vente pour le moment</p>
                ) : (
                  <div className="space-y-3">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sale.annonceEmoji}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{sale.annonceTitle}</p>
                            <p className="text-xs text-gray-400">par {sale.buyerName} · {formatDate(sale.date)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">+{sale.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Stats */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryStats).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune annonce publiée</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(categoryStats).map(([cat, data]) => {
                      const maxCount = Math.max(...Object.values(categoryStats).map(c => c.count), 1);
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{cat}</span>
                            <span className="text-gray-400">{data.count} annonce{data.count > 1 ? 's' : ''} · {data.purchases} vente{data.purchases > 1 ? 's' : ''}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange/70 rounded-full transition-all"
                              style={{ width: `${(data.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Stats */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  Parrainage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-green-700">{stats.totalParrainages}</p>
                    <p className="text-xs text-green-600">Filleuls</p>
                  </div>
                  <div className="bg-orange-bg rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-orange">{stats.totalPointsParrainage.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-orange">Points gagnés</p>
                  </div>
                </div>
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Code de parrainage</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">{user.referralCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange text-xs h-7"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        toast({ title: 'Copié !', description: 'Code de parrainage copié' });
                      }}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============ MES ANNONCES ============ */}
        {activeSection === 'annonces' && (
          <Card className="rounded-2xl border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Mes annonces ({stats.totalAnnonces})</CardTitle>
                <Link href="/deposer">
                  <Button className="bg-orange hover:bg-orange-dark text-white rounded-xl text-sm h-9">
                    + Nouvelle
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {mesAnnonces.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">Vous n&apos;avez pas encore d&apos;annonce</p>
                  <Link href="/deposer">
                    <Button className="bg-orange hover:bg-orange-dark text-white rounded-xl">
                      Déposer une annonce
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mesAnnonces.map((annonce) => (
                    <div
                      key={annonce.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/annonces/${annonce.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{annonce.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{annonce.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{annonce.category}</span>
                            <span>·</span>
                            <span>{formatPrice(annonce.price)}</span>
                            <span>·</span>
                            <span>{formatDate(annonce.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {annonce._count.purchases > 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <Eye className="w-3 h-3 mr-0.5" />
                            {annonce._count.purchases}
                          </Badge>
                        )}
                        {annonce.isVip && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            <Crown className="w-3 h-3 mr-0.5" />
                            {annonce.vipType === 'vip_king' ? 'KING' : 'VIP'}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============ MES ACHATS ============ */}
        {activeSection === 'achats' && (
          <Card className="rounded-2xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mes achats ({stats.totalAchats})</CardTitle>
            </CardHeader>
            <CardContent>
              {mesAchats.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">Vous n&apos;avez pas encore acheté de contact</p>
                  <Link href="/annonces">
                    <Button className="bg-orange hover:bg-orange-dark text-white rounded-xl">
                      Voir les annonces
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mesAchats.map((achat) => (
                    <div
                      key={achat.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/annonces/${achat.annonce.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achat.annonce.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{achat.annonce.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{achat.annonce.category}</span>
                            <span>·</span>
                            <span>{formatPrice(achat.annonce.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange">-{achat.points} pts</p>
                        <p className="text-xs text-gray-400">{formatDate(achat.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============ ANALYTICS ============ */}
        {activeSection === 'analytics' && (
          <div className="space-y-4">
            {/* Revenue Stats */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-500" />
                  Revenus & Valeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-600 mb-1">Points gagnés (ventes)</p>
                    <p className="text-2xl font-bold text-green-700">{stats.totalRevenusPoints.toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="bg-orange-bg rounded-xl p-4 text-center">
                    <p className="text-xs text-orange mb-1">Valeur totale annonces</p>
                    <p className="text-xl font-bold text-orange">{formatPrice(stats.totalValeurAnnonces)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                    <p className="text-xs text-purple-600 mb-1">Points parrainage</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalPointsParrainage.toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Chart */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange" />
                  Évolution mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48">
                  {monthlyData.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end w-full justify-center h-40">
                        <div
                          className="w-4 bg-orange/80 rounded-t transition-all"
                          style={{ height: `${(m.annonces / maxMonthlyValue) * 100}%`, minHeight: m.annonces > 0 ? 4 : 0 }}
                          title={`${m.annonces} annonces`}
                        />
                        <div
                          className="w-4 bg-green-400 rounded-t transition-all"
                          style={{ height: `${(m.ventes / maxMonthlyValue) * 100}%`, minHeight: m.ventes > 0 ? 4 : 0 }}
                          title={`${m.ventes} ventes`}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange/80 rounded" /> Annonces créées</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded" /> Contacts vendus</div>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Performance par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryStats).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(categoryStats)
                      .sort((a, b) => b[1].purchases - a[1].purchases)
                      .map(([cat, data]) => {
                        const maxCount = Math.max(...Object.values(categoryStats).map(c => c.count), 1);
                        const conversionRate = data.count > 0 ? ((data.purchases / data.count) * 100).toFixed(0) : '0';
                        return (
                          <div key={cat} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-800">{cat}</span>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-500">{data.count} annonce{data.count > 1 ? 's' : ''}</span>
                                <span className="text-green-600 font-medium">{data.purchases} vente{data.purchases > 1 ? 's' : ''}</span>
                                <Badge variant={parseInt(conversionRate) > 0 ? 'default' : 'secondary'} className={`text-xs ${parseInt(conversionRate) > 0 ? 'bg-green-100 text-green-700' : ''}`}>
                                  {conversionRate}% conv.
                                </Badge>
                              </div>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange to-green-400 rounded-full transition-all"
                                style={{ width: `${(data.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Taux de conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">Annonces publiées</p>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalAnnonces}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-600 mb-1">Annonces vendues</p>
                    <p className="text-3xl font-bold text-green-700">{stats.totalAnnoncesVendues}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-purple-600 mb-1">Taux de conversion</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {stats.totalAnnonces > 0 ? ((stats.totalAnnoncesVendues / stats.totalAnnonces) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
