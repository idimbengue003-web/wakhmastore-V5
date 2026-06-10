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

    // Add points to user
    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: {
        points: { increment: pkg.points },
      },
    });

    return securityHeaders(NextResponse.json({
      success: true,
      pointsAdded: pkg.points,
      newBalance: updatedUser.points,
      message: `${pkg.points.toLocaleString('fr-FR')} points ajoutés à votre compte !`,
    }));
  } catch (error) {
    console.error('Error purchasing points:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'achat de points' },
      { status: 500 }
    ));
  }
}
