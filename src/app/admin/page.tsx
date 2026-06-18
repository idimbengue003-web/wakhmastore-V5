'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingBag, DollarSign, Clock,
  CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle,
  Crown, Star, Zap, User, Eye, Phone, Mail, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, timeAgo, getPlanLabel } from '@/lib/constants';

interface AdminStats {
  counts: {
    totalUsers: number;
    totalAnnonces: number;
    pendingPointPurchases: number;
    pendingSubscriptions: number;
    completedPointPurchases: number;
    activeSubscriptions: number;
    totalPurchases: number;
    totalRevenueFcfa: number;
  };
  recentUsers: Array<{
    id: string; email: string; name: string | null; phone: string | null;
    role: string; plan: string; points: number; createdAt: string;
  }>;
  recentAnnonces: Array<{
    id: string; title: string; price: number; category: string;
    type: string; isVip: boolean; createdAt: string; authorName: string;
  }>;
  pendingPointPurchases: Array<{
    id: string; amountFcfa: number; pointsAdded: number; status: string;
    planId: string | null; purchaseType: string | null; source: string | null;
    senderPhone: string | null; createdAt: string; expiresAt: string | null;
    user: { id: string; email: string; name: string | null; phone: string | null };
  }>;
  pendingSubscriptions: Array<{
    id: string; plan: string; priceFcfa: number; status: string;
    createdAt: string;
    user: { id: string; email: string; name: string | null; phone: string | null };
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading, login } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('wakhma_user');
      if (stored) {
        try {
          login(JSON.parse(stored));
        } catch { /* ignore */ }
      }
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          login(data.user);
        }
      } catch { /* ignore */ }
    };
    init();
  }, [login]);

  useEffect(() => {
    if (!isLoading) setAuthChecked(true);
  }, [isLoading]);

  const loadStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (res.status === 403) {
        toast({
          title: 'Accès refusé',
          description: 'Vous n\'êtes pas administrateur.',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (authChecked) {
      if (!user) {
        router.push('/login?redirect=/admin');
        return;
      }
      if (user.role !== 'admin') {
        toast({
          title: 'Accès refusé',
          description: 'Cette page est réservée aux administrateurs.',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }
      loadStats();
    }
  }, [authChecked, user, router, toast, loadStats]);

  async function handleApprovePoints(purchaseId: string) {
    setActionLoading(prev => ({ ...prev, [`pp-${purchaseId}`]: true }));
    try {
      const res = await fetch('/api/admin/approve-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Points crédités',
          description: data.message,
        });
        loadStats();
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Échec approbation',
          variant: 'destructive',
        });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`pp-${purchaseId}`]: false }));
    }
  }

  async function handleReject(type: 'point_purchase' | 'subscription', id: string) {
    if (!confirm('Confirmer le rejet ?')) return;
    setActionLoading(prev => ({ ...prev, [`r-${id}`]: true }));
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Rejeté', description: data.message });
        loadStats();
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Échec du rejet',
          variant: 'destructive',
        });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`r-${id}`]: false }));
    }
  }

  async function handleApproveSubscription(subscriptionId: string) {
    setActionLoading(prev => ({ ...prev, [`s-${subscriptionId}`]: true }));
    try {
      const res = await fetch('/api/admin/approve-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Abonnement activé',
          description: data.message,
        });
        loadStats();
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Échec activation',
          variant: 'destructive',
        });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`s-${subscriptionId}`]: false }));
    }
  }

  if (isLoading || !authChecked) {
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

  if (!user || user.role !== 'admin') return null;

  const c = stats?.counts;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-orange" />
              Dashboard Admin
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Gestion de la plateforme Wakhma Store
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={refreshing}
            className="btn-press rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        ) : !stats ? (
          <Card className="border-red-200">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700">Impossible de charger les données.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Utilisateurs"
                value={c?.totalUsers ?? 0}
                color="blue"
              />
              <StatCard
                icon={<ShoppingBag className="w-5 h-5" />}
                label="Annonces"
                value={c?.totalAnnonces ?? 0}
                color="orange"
              />
              <StatCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Revenus (FCFA)"
                value={formatPrice(c?.totalRevenueFcfa ?? 0).replace(' FCFA', '')}
                color="green"
              />
              <StatCard
                icon={<Eye className="w-5 h-5" />}
                label="Contacts débloqués"
                value={c?.totalPurchases ?? 0}
                color="purple"
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <MiniStat label="Achats points (en attente)" value={c?.pendingPointPurchases ?? 0} alert={(c?.pendingPointPurchases ?? 0) > 0} />
              <MiniStat label="Abonnements (en attente)" value={c?.pendingSubscriptions ?? 0} alert={(c?.pendingSubscriptions ?? 0) > 0} />
              <MiniStat label="Achats points (validés)" value={c?.completedPointPurchases ?? 0} />
              <MiniStat label="Abonnements actifs" value={c?.activeSubscriptions ?? 0} />
            </div>

            {/* Pending point purchases */}
            <Card className="mb-6 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Achats de points en attente
                  {stats.pendingPointPurchases.length > 0 && (
                    <Badge className="bg-amber-500 text-white">{stats.pendingPointPurchases.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.pendingPointPurchases.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    Aucun achat en attente — tout est à jour.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.pendingPointPurchases.map(p => (
                      <div
                        key={p.id}
                        className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-orange text-base">{formatPrice(p.amountFcfa)}</span>
                              <Badge variant="secondary" className="text-xs">
                                +{p.pointsAdded.toLocaleString('fr-FR')} pts
                              </Badge>
                              {p.purchaseType && (
                                <Badge variant="outline" className="text-xs">
                                  {p.purchaseType === 'abonnement' ? 'Abonnement' : 'Points'}
                                </Badge>
                              )}
                              {p.planId && (
                                <Badge variant="outline" className="text-xs">
                                  {p.planId}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {p.user.name || p.user.email}
                              </span>
                              {p.user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {p.user.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {timeAgo(p.createdAt)}
                              </span>
                              {p.senderPhone && (
                                <span className="text-xs text-gray-500">
                                  Expéditeur Wave: {p.senderPhone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApprovePoints(p.id)}
                              disabled={actionLoading[`pp-${p.id}`]}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading[`pp-${p.id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              )}
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject('point_purchase', p.id)}
                              disabled={actionLoading[`r-${p.id}`]}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading[`r-${p.id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending subscriptions */}
            <Card className="mb-6 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Abonnements en attente
                  {stats.pendingSubscriptions.length > 0 && (
                    <Badge className="bg-amber-500 text-white">{stats.pendingSubscriptions.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.pendingSubscriptions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    Aucun abonnement en attente.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.pendingSubscriptions.map(s => (
                      <div
                        key={s.id}
                        className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-orange text-base">{formatPrice(s.priceFcfa)}</span>
                              <Badge variant="outline" className="text-xs">
                                {s.plan === 'vip_king' ? '👑 VIP KING' :
                                  s.plan === 'diambar' ? '💪🏽 DIAMBAR' :
                                  s.plan === 'gratuit' ? '⚡ BOLT' : s.plan}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {s.user.name || s.user.email}
                              </span>
                              {s.user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {s.user.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {timeAgo(s.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSubscription(s.id)}
                              disabled={actionLoading[`s-${s.id}`]}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading[`s-${s.id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              )}
                              Activer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject('subscription', s.id)}
                              disabled={actionLoading[`r-${s.id}`]}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading[`r-${s.id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Two columns: recent users + recent annonces */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent users */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Derniers utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.recentUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          u.role === 'admin' ? 'bg-red-500' :
                          u.plan === 'vip_king' ? 'bg-amber-500' :
                          u.plan === 'diambar' ? 'bg-green-500' :
                          u.plan === 'gratuit' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {u.name || u.email}
                            {u.role === 'admin' && <Badge variant="secondary" className="ml-2 text-[10px]">ADMIN</Badge>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {u.email} • {u.points.toLocaleString('fr-FR')} pts
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {timeAgo(u.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent annonces */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange" />
                    Dernières annonces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.recentAnnonces.map(a => (
                      <a
                        key={a.id}
                        href={`/annonces/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${
                          a.type === 'je_vends' ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          {a.type === 'je_vends' ? '💰' : '🔍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {a.title}
                            {a.isVip && (
                              <Badge variant="secondary" className="ml-2 text-[10px]">
                                VIP
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {a.category} • {a.authorName} • {formatPrice(a.price)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {timeAgo(a.createdAt)}
                        </span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ── Composants internes ──

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'orange' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-bg text-orange',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="border-gray-100">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${
      alert && value > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'
    }`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${alert && value > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
