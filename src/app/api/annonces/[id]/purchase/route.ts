import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

// Unlock cost based on user's subscription plan
function getUnlockCost(plan: string): number {
  switch (plan) {
    case 'diambar':
      return 1000;
    case 'vip_king':
      return 800;
    default:
      return 1500;
  }
}

// POST: Purchase access to an annonce's contact info
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
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
      return securityHeaders(NextResponse.json({
        success: true,
        message: 'Accès déjà débloqué',
        phone: annonce.phone,
        whatsapp: annonce.whatsapp,
        pointsDeducted: 0,
      }));
    }

    // Get user with plan info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, points: true, plan: true },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    // Calculate unlock cost based on subscription plan
    const pointsToUnlock = getUnlockCost(user.plan);

    if (user.points < pointsToUnlock) {
      return securityHeaders(NextResponse.json({
        error: 'Points insuffisants',
        currentPoints: user.points,
        requiredPoints: pointsToUnlock,
        missingPoints: pointsToUnlock - user.points,
        plan: user.plan,
      }, { status: 400 }));
    }

    // Deduct points and create purchase record
    await db.$transaction([
      db.purchase.create({
        data: {
          userId: payload.userId,
          annonceId: id,
          points: pointsToUnlock,
        },
      }),
      db.user.update({
        where: { id: payload.userId },
        data: { points: user.points - pointsToUnlock },
      }),
    ]);

    const planLabel = user.plan === 'vip_king' ? 'VIP KING' : user.plan === 'diambar' ? 'Diambar' : 'Gratuit';

    return securityHeaders(NextResponse.json({
      success: true,
      message: `Accès débloqué avec succès ! (${planLabel} : ${pointsToUnlock} pts)`,
      phone: annonce.phone,
      whatsapp: annonce.whatsapp,
      pointsDeducted: pointsToUnlock,
      remainingPoints: user.points - pointsToUnlock,
      plan: user.plan,
    }));
  } catch (error) {
    console.error('Error purchasing annonce access:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du débloquage de l\'annonce' },
      { status: 500 }
    ));
  }
}
