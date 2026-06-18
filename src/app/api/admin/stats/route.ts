import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

/**
 * GET /api/admin/stats
 * Admin-only: renvoie les statistiques et listes pour le dashboard admin.
 *
 * Inclut:
 *  - Compteurs globaux (users, annonces, revenue estimé)
 *  - Liste des achats de points en attente
 *  - Liste des abonnements en attente
 *  - Derniers utilisateurs inscrits
 *  - Dernières annonces publiées
 */
export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'admin') {
      return securityHeaders(NextResponse.json(
        { error: 'Accès refusé. Réservé aux administrateurs.' },
        { status: 403 }
      ));
    }

    // ── Compteurs globaux (une seule query groupée quand possible) ──
    const [
      totalUsers,
      totalAnnonces,
      pendingPointPurchases,
      pendingSubscriptions,
      completedPointPurchases,
      activeSubscriptions,
      totalPurchases,
      recentUsers,
      recentAnnonces,
      pendingPointPurchasesList,
      pendingSubscriptionsList,
    ] = await Promise.all([
      db.user.count(),
      db.annonce.count(),
      db.pointPurchase.count({ where: { status: 'pending' } }),
      db.subscription.count({ where: { status: 'pending' } }),
      db.pointPurchase.count({ where: { status: 'completed' } }),
      db.subscription.count({ where: { status: 'active' } }),
      db.purchase.count(),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          plan: true,
          points: true,
          createdAt: true,
        },
      }),
      db.annonce.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          type: true,
          isVip: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
        },
      }),
      db.pointPurchase.findMany({
        where: { status: 'pending' },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true },
          },
        },
      }),
      db.subscription.findMany({
        where: { status: 'pending' },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true },
          },
        },
      }),
    ]);

    // ── Revenue estimé (somme des achats de points complétés + abonnements actifs) ──
    const revenueAgg = await db.pointPurchase.aggregate({
      where: { status: 'completed' },
      _sum: { amountFcfa: true },
    });
    const subRevenueAgg = await db.subscription.aggregate({
      where: { status: 'active' },
      _sum: { priceFcfa: true },
    });
    const totalRevenueFcfa =
      (revenueAgg._sum.amountFcfa || 0) + (subRevenueAgg._sum.priceFcfa || 0);

    return securityHeaders(NextResponse.json({
      counts: {
        totalUsers,
        totalAnnonces,
        pendingPointPurchases,
        pendingSubscriptions,
        completedPointPurchases,
        activeSubscriptions,
        totalPurchases,
        totalRevenueFcfa,
      },
      recentUsers: recentUsers.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentAnnonces: recentAnnonces.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        authorName: a.author.name || a.author.email,
      })),
      pendingPointPurchases: pendingPointPurchasesList.map(p => ({
        id: p.id,
        amountFcfa: p.amountFcfa,
        pointsAdded: p.pointsAdded,
        status: p.status,
        planId: p.planId,
        purchaseType: p.purchaseType,
        source: p.source,
        senderPhone: p.senderPhone,
        createdAt: p.createdAt.toISOString(),
        expiresAt: p.expiresAt?.toISOString() || null,
        user: {
          id: p.user.id,
          email: p.user.email,
          name: p.user.name,
          phone: p.user.phone,
        },
      })),
      pendingSubscriptions: pendingSubscriptionsList.map(s => ({
        id: s.id,
        plan: s.plan,
        priceFcfa: s.priceFcfa,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        user: {
          id: s.user.id,
          email: s.user.email,
          name: s.user.name,
          phone: s.user.phone,
        },
      })),
    }));
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    ));
  }
}
