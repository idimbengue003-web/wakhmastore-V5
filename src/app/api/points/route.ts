import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

// Point purchase pricing tiers
export const POINT_PACKAGES = [
  { id: 'starter', amountFcfa: 1300, points: 7000, label: 'Starter', popular: false },
  { id: 'standard', amountFcfa: 2500, points: 17000, label: 'Standard', popular: true },
  { id: 'premium', amountFcfa: 5000, points: 50000, label: 'Premium', popular: false },
  { id: 'ultimate', amountFcfa: 10000, points: 105000, label: 'Ultimate', popular: false },
] as const;

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { packageId, paymentMethod } = body;

    // Validate package
    const pkg = POINT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return securityHeaders(NextResponse.json(
        { error: 'Pack de points invalide' },
        { status: 400 }
      ));
    }

    // Validate payment method
    const validMethods = ['wave', 'orange_money'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return securityHeaders(NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      ));
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, points: true, name: true, email: true, phone: true },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    // For now, we'll create a pending purchase that gets auto-completed
    // In production, this would wait for payment confirmation from Wave/OM API
    const purchase = await db.pointPurchase.create({
      data: {
        userId: user.id,
        amountFcfa: pkg.amountFcfa,
        pointsAdded: pkg.points,
        paymentMethod,
        status: 'completed', // Auto-complete for demo; in production use 'pending'
      },
    });

    // Credit points to user
    await db.user.update({
      where: { id: user.id },
      data: { points: user.points + pkg.points },
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: `${pkg.points.toLocaleString('fr-FR')} points ajoutés à votre compte !`,
      purchase: {
        id: purchase.id,
        amountFcfa: pkg.amountFcfa,
        pointsAdded: pkg.points,
        paymentMethod,
        status: purchase.status,
      },
      newBalance: user.points + pkg.points,
    }));
  } catch (error) {
    console.error('Error purchasing points:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'achat de points' },
      { status: 500 }
    ));
  }
}

// GET: Return available point packages
export async function GET() {
  return securityHeaders(NextResponse.json({ packages: POINT_PACKAGES }));
}
