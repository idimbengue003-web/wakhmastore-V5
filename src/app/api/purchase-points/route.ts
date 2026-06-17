import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { POINT_PACKAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const { packageId } = body;

    const pkg = POINT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return securityHeaders(NextResponse.json(
        { error: 'Package invalide' },
        { status: 400 }
      ));
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      ));
    }

    // Create a PointPurchase record with PENDING status — admin must verify payment
    const pointPurchase = await db.pointPurchase.create({
      data: {
        userId: payload.userId,
        amountFcfa: pkg.price,
        pointsAdded: pkg.points,
        status: 'pending', // Wait for admin to confirm payment
        paymentMethod: body.paymentMethod || null,
      },
    });

    // Do NOT auto-credit points — wait for admin approval
    return securityHeaders(NextResponse.json({
      success: true,
      message: `Redirection vers la page de paiement sécurisée Wave pour ${pkg.points.toLocaleString('fr-FR')} points (${pkg.price.toLocaleString('fr-FR')} FCFA). Vos points seront crédités automatiquement après confirmation du paiement.`,
      purchaseId: pointPurchase.id,
      pointsRequested: pkg.points,
      amountFcfa: pkg.price,
      status: 'pending',
    }));
  } catch (error) {
    console.error('Error purchasing points:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'achat de points' },
      { status: 500 }
    ));
  }
}
