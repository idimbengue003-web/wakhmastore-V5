'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Loader2, Coins, Crown, Sparkles,
  ArrowRight, RefreshCw, Home, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';

type PaymentStatus = 'succes' | 'echec' | 'attente' | 'inconnu';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshAuth } = useAuth();

  const txn = searchParams.get('txn') || '';
  const statusParam = (searchParams.get('status') || '').toLowerCase();
  const montant = searchParams.get('montant') || '';
  const plan = searchParams.get('plan') || '';
  const pointsFromUrl = searchParams.get('points') || '';
  const pendingId = searchParams.get('pending') || '';

  // Compute initial status from URL params
  // If we have a pendingId but no explicit status, treat as 'attente' (pending payment in progress)
  const initialStatus: PaymentStatus =
    statusParam === 'succes' ? 'succes'
    : statusParam === 'echec' || statusParam === 'echec_paiement' ? 'echec'
    : statusParam === 'attente' ? 'attente'
    : pendingId ? 'attente' // We have a pending payment → show "waiting" UI
    : 'inconnu';

  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [pointsBefore, setPointsBefore] = useState<number | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const initialPointsStored = useRef(false);

  // Capture the user's points balance on first mount (before refresh).
  // We'll compare this to the refreshed balance to detect if credits arrived.
  useEffect(() => {
    if (!initialPointsStored.current && user) {
      setPointsBefore(user.points);
      initialPointsStored.current = true;
    }
  }, [user]);

  // When status is 'attente' with a pendingId, poll /api/payment-status every 3s.
  // This endpoint checks Wave Business directly and confirms the payment server-side.
  // Polling stops when status becomes 'succes' or 'echec', or after max attempts.
  useEffect(() => {
    if (status !== 'attente' || !pendingId) return;

    let cancelled = false;
    const maxAttempts = 200; // 200 * 3s = 600s = 10 min max
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;
      attempt++;
      setPollCount(attempt);

      try {
        const res = await fetch(`/api/payment-status?id=${encodeURIComponent(pendingId)}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();

          if (data.status === 'confirmed') {
            // ⭐ Paiement confirmé côté serveur — points crédités
            await refreshAuth?.();
            setStatus('succes');
            // Si on a les points crédit depuis la réponse, on les affiche
            if (data.points) {
              // Remplacer pointsFromUrl par la vraie valeur si pas déjà présente
              if (!pointsFromUrl) {
                searchParams.get('points'); // no-op — juste pour référence
              }
            }
            return; // stop polling
          }

          if (data.status === 'expired') {
            setStatus('echec');
            return;
          }

          if (data.status === 'forbidden' || data.status === 'not_found') {
            console.warn('[payment-status] forbidden/not_found — arrêt du polling');
            setStatus('inconnu');
            return;
          }

          if (data.status === 'pending') {
            // Continue polling
            console.log(`[payment-status] poll #${attempt} → pending`);
          }
        }
      } catch (err) {
        console.error('[payment-status] network error:', err);
      }

      // Continue si pas dépassé le max
      if (attempt < maxAttempts) {
        timeoutId = setTimeout(poll, 3000);
      } else {
        console.warn('[payment-status] max attempts reached — switching to echec');
        setStatus('echec');
      }
    };

    // Démarrer le poll immédiatement (1ère seconde pour rapidité)
    timeoutId = setTimeout(poll, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pendingId]);

  // LEGACY : si status=succes sans pendingId (ancien flow gateway webhook),
  // on poll /api/auth/me pour détecter le crédit (comportement précédent conservé)
  useEffect(() => {
    if (status !== 'succes' || pendingId) return; // skip si on a déjà un pending (nouveau flow)

    let cancelled = false;
    const maxAttempts = 30; // 90s max
    let attempt = 0;
    const initialBalance = pointsBefore ?? 0;

    const poll = async () => {
      if (cancelled) return;
      attempt++;
      setPollCount(attempt);
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            await refreshAuth?.();
            const currentBalance = data.user.points;
            const balanceIncreased = currentBalance > initialBalance;
            const planChanged = plan && data.user.plan !== user?.plan;

            if (balanceIncreased || planChanged) {
              return; // success détecté
            }
          }
        }
      } catch {
        // network error — keep polling
      }
      if (attempt < maxAttempts) {
        setTimeout(poll, 3000);
      }
    };

    const initial = setTimeout(poll, 2000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pendingId]);

  const pointsAfter = user?.points ?? null;
  const pointsDelta =
    pointsBefore !== null && pointsAfter !== null
      ? Math.max(0, pointsAfter - pointsBefore)
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* SUCCESS */}
        {status === 'succes' && (
          <Card className="border-green-200 shadow-lg shadow-green-500/5">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              {/* Animated checkmark */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Paiement confirmé !
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Votre paiement de <strong>{Number(montant || 0).toLocaleString('fr-FR')} FCFA</strong> a bien été reçu.
                </p>
              </div>

              {/* Plan badge */}
              {plan && (
                <div className="flex justify-center">
                  <Badge className="bg-orange/10 text-orange border border-orange/20 px-4 py-1.5 text-sm font-semibold">
                    {pointsFromUrl ? (
                      <>
                        <Coins className="w-4 h-4 mr-1.5" />
                        +{Number(pointsFromUrl).toLocaleString('fr-FR')} points
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-1.5" />
                        Abonnement activé
                      </>
                    )}
                  </Badge>
                </div>
              )}

              {/* Credit status */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                {pointsDelta !== null && pointsDelta > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">
                        +{pointsDelta.toLocaleString('fr-FR')} points crédités !
                      </span>
                    </div>
                    <p className="text-xs text-green-600">
                      Nouveau solde : <strong>{pointsAfter?.toLocaleString('fr-FR')}</strong> points
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-amber-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-semibold text-sm">
                        Crédit en cours de synchronisation{pollCount > 0 ? ` (${pollCount}/20)` : '...'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600">
                      Vos points seront visibles dans quelques secondes. Vous pouvez aussi rafraîchir la page.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Rafraîchir
                    </Button>
                  </>
                )}
              </div>

              {/* Transaction details */}
              {txn && (
                <div className="text-xs text-gray-400 font-mono">
                  Référence : {txn}
                </div>
              )}

              {/* CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => router.push('/annonces')}
                  className="bg-orange hover:bg-orange-dark text-white h-12"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voir les annonces
                </Button>
                <Button
                  onClick={() => router.push('/profil')}
                  variant="outline"
                  className="h-12"
                >
                  Mon profil
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ECHEC */}
        {status === 'echec' && (
          <Card className="border-red-200 shadow-lg shadow-red-500/5">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Paiement échoué
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  La transaction n&apos;a pas pu être validée. Aucun montant n&apos;a été débité de votre compte.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Que s&apos;est-il passé ?</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                      <li>Vous avez peut-être annulé le paiement dans Wave</li>
                      <li>Le délai de la transaction a expiré</li>
                      <li>Solde Wave insuffisant</li>
                    </ul>
                  </div>
                </div>
              </div>

              {txn && (
                <div className="text-xs text-gray-400 font-mono">
                  Référence : {txn}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => router.push('/recharge')}
                  className="bg-orange hover:bg-orange-dark text-white h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="h-12"
                >
                  Accueil
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ATTENTE */}
        {status === 'attente' && (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Paiement en cours de vérification
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Nous vérifions votre paiement. Cette page se mettra à jour automatiquement.
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" className="h-12">
                <RefreshCw className="w-4 h-4 mr-2" />
                Rafraîchir
              </Button>
            </CardContent>
          </Card>
        )}

        {/* INCONNU — pas de params URL */}
        {status === 'inconnu' && (
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Aucun paiement en cours
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Vous êtes arrivé sur cette page sans paramètres de transaction valides.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push('/recharge')}
                  className="bg-orange hover:bg-orange-dark text-white h-12"
                >
                  Voir les offres
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="h-12">
                  Accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PaiementConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
