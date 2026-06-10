import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateToken, generateRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { db } from '@/lib/db';
import { securityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('wakhma_refresh')?.value;
    
    if (!refreshToken) {
      return securityHeaders(NextResponse.json(
        { error: 'Session expirée. Reconnectez-vous.' },
        { status: 401 }
      ));
    }
    
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      const response = NextResponse.json(
        { error: 'Session invalide. Reconnectez-vous.' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return securityHeaders(response);
    }
    
    // Get fresh user data
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, plan: true, points: true, phone: true, referralCode: true },
    });
    
    if (!user) {
      const response = NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return securityHeaders(response);
    }
    
    // Generate new access token
    const newAccessToken = generateToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });
    
    const response = NextResponse.json({
      token: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        points: user.points,
        referralCode: user.referralCode,
      },
    });
    
    setAuthCookies(response, newAccessToken, newRefreshToken);
    return securityHeaders(response);
  } catch (error) {
    console.error('Error refreshing token:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du rafraîchissement de la session' },
      { status: 500 }
    ));
  }
}
