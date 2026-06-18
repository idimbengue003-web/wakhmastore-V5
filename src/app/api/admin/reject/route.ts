import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

/**
 * POST /api/admin/reject
 * Admin-only: rejette un achat de points ou un abonnement en attente.
 *
 * Body: { type: 'point_purchase' | 'subscription', id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'admin') {
      return securityHeaders(NextResponse.json(
        { error: 'Accès refusé. Réservé aux administrateurs.' },
        { status: 403 }
      ));
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return securityHeaders(NextResponse.json(
        { error: 'Type et ID requis' },
        { status: 400 }
      ));
    }

    if (type === 'point_purchase') {
      const purchase = await db.pointPurchase.findUnique({ where: { id } });
      if (!purchase) {
        return securityHeaders(NextResponse.json(
          { error: 'Achat non trouvé' },
          { status: 404 }
        ));
      }
      if (purchase.status !== 'pending') {
        return securityHeaders(NextResponse.json(
          { error: `Achat déjà ${purchase.status}` },
          { status: 400 }
        ));
      }
      await db.pointPurchase.update({
        where: { id },
        data: { status: 'rejected' },
      });
      return securityHeaders(NextResponse.json({
        success: true,
        message: 'Achat de points rejeté.',
      }));
    }

    if (type === 'subscription') {
      const sub = await db.subscription.findUnique({ where: { id } });
      if (!sub) {
        return securityHeaders(NextResponse.json(
          { error: 'Abonnement non trouvé' },
          { status: 404 }
        ));
      }
      if (sub.status !== 'pending') {
        return securityHeaders(NextResponse.json(
          { error: `Abonnement déjà ${sub.status}` },
          { status: 400 }
        ));
      }
      await db.subscription.update({
        where: { id },
        data: { status: 'cancelled' },
      });
      return securityHeaders(NextResponse.json({
        success: true,
        message: 'Abonnement rejeté.',
      }));
    }

    return securityHeaders(NextResponse.json(
      { error: 'Type invalide (attendu: point_purchase | subscription)' },
      { status: 400 }
    ));
  } catch (error) {
    console.error('Error rejecting:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du rejet' },
      { status: 500 }
    ));
  }
}
