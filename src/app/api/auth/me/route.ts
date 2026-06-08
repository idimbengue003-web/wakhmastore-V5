import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      ));
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        points: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        _count: {
          select: {
            annonces: true,
            referrals: true,
          },
        },
      },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    return securityHeaders(NextResponse.json(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement du profil' },
      { status: 500 }
    ));
  }
}
