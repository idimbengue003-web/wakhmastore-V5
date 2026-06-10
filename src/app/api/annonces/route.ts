import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityHeaders } from '@/lib/security-headers';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build where clause using Prisma
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const [annonces, total] = await Promise.all([
      db.annonce.findMany({
        where,
        include: {
          author: { select: { name: true } },
          _count: { select: { purchases: true } },
        },
        orderBy: [
          { isVip: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      db.annonce.count({ where }),
    ]);

    const response = NextResponse.json(annonces.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      price: a.price,
      category: a.category,
      location: a.location,
      emoji: a.emoji,
      isVip: a.isVip,
      vipType: a.vipType,
      authorId: a.authorId,
      authorName: a.author.name || 'Vendeur',
      createdAt: a.createdAt,
      _count: { purchases: a._count.purchases },
    })));
    response.headers.set('X-Total-Count', String(total));
    return securityHeaders(response);
  } catch (error) {
    console.error('Error fetching annonces:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement des annonces' },
      { status: 500 }
    ));
  }
}
