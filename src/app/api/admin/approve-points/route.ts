import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

/**
 * POST /api/admin/approve-points
 * Admin-only: Approve a pending point purchase, credit points to the user.
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
    const { purchaseId } = body;

    if (!purchaseId) {
      return securityHeaders(NextResponse.json(
        { error: 'ID d\'achat requis' },
        { status: 400 }
      ));
    }

    const purchase = await db.pointPurchase.findUnique({
      where: { id: purchaseId },
    });

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

    // Approve purchase and credit points in a transaction
    const result = await db.$transaction(async (tx) => {
      const updatedPurchase = await tx.pointPurchase.update({
        where: { id: purchaseId },
        data: { status: 'completed' },
      });

      const updatedUser = await tx.user.update({
        where: { id: purchase.userId },
        data: {
          points: { increment: purchase.pointsAdded },
        },
      });

      return { purchase: updatedPurchase, user: updatedUser };
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: `${purchase.pointsAdded.toLocaleString('fr-FR')} points crédités à l'utilisateur.`,
      purchaseId: purchase.id,
      pointsAdded: purchase.pointsAdded,
      newBalance: result.user.points,
    }));
  } catch (error) {
    console.error('Error approving points:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'approbation' },
      { status: 500 }
    ));
  }
}
