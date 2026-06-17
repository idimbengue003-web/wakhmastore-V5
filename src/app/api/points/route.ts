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

    // Validate payment method (Wave only)
    const validMethods = ['wave'];
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

    // Create a PENDING purchase — admin must verify payment before points are credited
    const purchase = await db.pointPurchase.create({
      data: {
        userId: user.id,
        amountFcfa: pkg.amountFcfa,
        pointsAdded: pkg.points,
        paymentMethod,
        status: 'pending',
      },
    });

    // Do NOT auto-credit points — wait for admin approval
    return securityHeaders(NextResponse.json({
      success: true,
      message: `Redirection vers la page de paiement sécurisée Wave pour ${pkg.points.toLocaleString('fr-FR')} points (${pkg.amountFcfa.toLocaleString('fr-FR')} FCFA). Vos points seront crédités automatiquement après confirmation du paiement.`,
      purchase: {
        id: purchase.id,
        amountFcfa: pkg.amountFcfa,
        pointsAdded: pkg.points,
        paymentMethod,
        status: 'pending',
      },
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
