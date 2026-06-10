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

    // Get user with counts using Prisma
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
            purchases: true,
          },
        },
        referrals: {
          select: { points: true },
        },
      },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    // Get annonces with purchase count
    const mesAnnonces = await db.annonce.findMany({
      where: { authorId: payload.userId },
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        emoji: true,
        isVip: true,
        vipType: true,
        createdAt: true,
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Compute stats
    const totalAnnonces = user._count.annonces;
    const totalAnnoncesVendues = mesAnnonces.filter(a => a._count.purchases > 0).length;
    const totalPurchasesReceived = mesAnnonces.reduce((sum, a) => sum + a._count.purchases, 0);
    const totalRevenusPoints = totalPurchasesReceived * 1500;
    const totalValeurAnnonces = mesAnnonces.reduce((sum, a) => sum + a.price, 0);
    const totalReferralPoints = user.referrals.reduce((sum, r) => sum + r.points, 0);

    const categoryStats: Record<string, { count: number; purchases: number }> = {};
    for (const annonce of mesAnnonces) {
      if (!categoryStats[annonce.category]) {
        categoryStats[annonce.category] = { count: 0, purchases: 0 };
      }
      categoryStats[annonce.category].count++;
      categoryStats[annonce.category].purchases += annonce._count.purchases;
    }

    // Simple monthly data
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyData.push({
        month: monthNames[monthDate.getMonth()],
        annonces: i === 0 ? totalAnnonces : 0,
        ventes: i === 0 ? totalPurchasesReceived : 0,
      });
    }

    const plan = user.plan;
    return securityHeaders(NextResponse.json({
      user: {
        ...user,
        planLabel: plan === 'vip_king' ? 'VIP KING' : plan === 'diambar' ? 'DIAMBAR' : 'BOLT ⚡ Diambar',
      },
      stats: {
        totalAnnonces,
        totalAnnoncesVendues,
        totalPurchasesReceived,
        totalRevenusPoints,
        totalValeurAnnonces,
        totalAchats: user._count.purchases,
        totalParrainages: user._count.referrals,
        totalPointsParrainage: totalReferralPoints,
      },
      categoryStats,
      monthlyData,
      mesAnnonces,
      mesAchats: [],
      recentSales: [],
    }));
  } catch (error) {
    console.error('Error fetching user:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement du profil' },
      { status: 500 }
    ));
  }
}
