import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

const POINTS_TO_UNLOCK = 1500;

// POST: Purchase access to an annonce's contact info (1500 points)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(ip);
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      ));
    }

    // Authentication required
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise. Connectez-vous d\'abord.' },
        { status: 401 }
      ));
    }

    // Check if annonce exists
    const annonce = await db.annonce.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!annonce) {
      return securityHeaders(NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      ));
    }

    // Can't purchase your own annonce
    if (annonce.authorId === payload.userId) {
      return securityHeaders(NextResponse.json(
        { error: 'Vous ne pouvez pas acheter l\'accès à votre propre annonce' },
        { status: 400 }
      ));
    }

    // Check if already purchased
    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_annonceId: {
          userId: payload.userId,
          annonceId: id,
        },
      },
    });

    if (existingPurchase) {
      // Already purchased, return the contact info
      return securityHeaders(NextResponse.json({
        success: true,
        message: 'Accès déjà débloqué',
        phone: annonce.phone,
        whatsapp: annonce.whatsapp,
        pointsDeducted: 0,
      }));
    }

    // Check user points (inside transaction for consistency)
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, points: true },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.points < POINTS_TO_UNLOCK) {
        throw new Error('INSUFFICIENT_POINTS');
      }

      // Create purchase and deduct points atomically
      const purchase = await tx.purchase.create({
        data: {
          userId: payload.userId,
          annonceId: id,
          points: POINTS_TO_UNLOCK,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: payload.userId },
        data: { points: { decrement: POINTS_TO_UNLOCK } },
      });

      return { purchase, updatedUser };
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: 'Accès débloqué avec succès !',
      phone: annonce.phone,
      whatsapp: annonce.whatsapp,
      pointsDeducted: POINTS_TO_UNLOCK,
      remainingPoints: result.updatedUser.points,
    }));
  } catch (error) {
    // Handle custom transaction errors
    if (error instanceof Error) {
      if (error.message === 'USER_NOT_FOUND') {
        return securityHeaders(NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        ));
      }
      if (error.message === 'INSUFFICIENT_POINTS') {
        return securityHeaders(NextResponse.json(
          {
            error: 'Points insuffisants',
            requiredPoints: POINTS_TO_UNLOCK,
          },
          { status: 400 }
        ));
      }
    }
    console.error('Error purchasing annonce access:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du débloquage de l\'annonce' },
      { status: 500 }
    ));
  }
}
