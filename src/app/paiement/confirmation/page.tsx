'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Loader2, Coins, Crown, Sparkles,
  ArrowRight, RefreshCw, Home, AlertCircle, ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { buildWaveCheckoutUrl, WAVE_CHECKOUT_URL } from '@/lib/constants';

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
  const errorMsg = searchParams.get('error') || '';

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

  const montantNum = Number(montant || 0);

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
                  Votre paiement de <strong>{montantNum.toLocaleString('fr-FR')} FCFA</strong> a bien été reçu.
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

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                    <div className="text-xs text-red-800">
                      <p className="font-semibold mb-0.5">Détail de l&apos;erreur :</p>
                      <p className="font-mono break-all">{decodeURIComponent(errorMsg)}</p>
                    </div>
                  </div>
                </div>
              )}

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

        {/* ATTENTE — with full payment instructions */}
        {status === 'attente' && (
          <div className="space-y-4">
            {/* Title card */}
            <Card className="border-amber-200 shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                    Paiement en attente
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Envoyez l&apos;argent via Wave pour valider votre achat. La vérification est automatique.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amount to pay */}
            {montantNum > 0 && (
              <Card className="border-2 border-orange">
                <CardContent className="p-6 text-center space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Montant à envoyer
                  </p>
                  <p className="text-4xl font-black text-orange">
                    {montantNum.toLocaleString('fr-FR')}
                    <span className="text-lg font-semibold text-gray-500 ml-2">FCFA</span>
                  </p>
                  {pointsFromUrl && (
                    <p className="text-sm text-gray-600">
                      pour <strong>{Number(pointsFromUrl).toLocaleString('fr-FR')} points</strong>
                    </p>
                  )}
                  {plan && !pointsFromUrl && (
                    <p className="text-sm text-gray-600">
                      abonnement <strong className="capitalize">{plan}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vendor phone — copy button (DÉSACTIVÉ : on ne montre plus le numéro
                pour empêcher les annulations de transfert manuel. À la place,
                on redirige vers une page de paiement Wave Business avec montant
                pré-rempli — la transaction est alors traitée comme un paiement
                marchand, beaucoup plus difficile à annuler côté client.) */}

            {/* Bouton "Payer avec Wave" — redirige vers Wave Business checkout */}
            {montantNum > 0 && pendingId && (
              <Card className="border-2 border-[#1DC3E0]">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Paiement sécurisé Wave
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliquez sur le bouton ci-dessous : Wave s&apos;ouvrira avec le montant pré-rempli.
                    </p>
                  </div>

                  {WAVE_CHECKOUT_URL ? (
                    <a
                      href={buildWaveCheckoutUrl(montantNum, pendingId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className="w-full bg-[#1DC3E0] hover:bg-[#17a8c4] text-white font-bold rounded-xl h-14 text-base"
                        type="button"
                      >
                        <Smartphone className="w-5 h-5 mr-2" />
                        Payer {montantNum.toLocaleString('fr-FR')} FCFA avec Wave
                      </Button>
                    </a>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                        <div className="text-xs text-red-800">
                          <p className="font-semibold mb-0.5">Paiement indisponible</p>
                          <p>
                            Le lien de paiement Wave Business n&apos;est pas configuré.
                            Contactez le support ou réessayez dans quelques minutes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-500">
                    Vous n&apos;avez rien à saisir — le montant est déjà inscrit.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-blue-100 bg-blue-50/50">
              <CardContent className="p-5 space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Comment payer
                </h2>
                <ol className="space-y-2.5 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>
                      Cliquez sur <strong>« Payer {montantNum.toLocaleString('fr-FR')} FCFA avec Wave »</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>
                      Wave s&apos;ouvre avec le montant <strong>{montantNum.toLocaleString('fr-FR')} FCFA</strong> déjà pré-rempli
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>
                      Confirmez le paiement dans Wave (votre code PIN ou biométrie)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange text-white text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <span>
                      Revenez sur cette page — vos points seront crédités <strong>automatiquement</strong> dans quelques secondes.
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Polling status */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-semibold text-sm">
                    Vérification automatique en cours...
                  </span>
                </div>
                <p className="text-xs text-amber-600">
                  {pollCount > 0
                    ? `Vérification #${pollCount} · Nous interrogeons Wave Business toutes les 3s.`
                    : 'Nous interrogeons Wave Business pour détecter votre paiement.'}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  J'ai payé — Relancer la vérification
                </Button>
              </CardContent>
            </Card>

            {/* Security reassurance */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                Paiement 100% sécurisé via Wave Business. Aucune information bancaire n&apos;est stockée sur notre serveur. Si vous fermez cette page, vous pouvez y revenir via le lien dans votre email.
              </p>
            </div>

            {/* Cancel */}
            <div className="text-center pt-2">
              <Button
                onClick={() => router.push('/recharge')}
                variant="ghost"
                size="sm"
                className="text-gray-500"
              >
                Annuler et retourner aux offres
              </Button>
            </div>
          </div>
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
