import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

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
      type: a.type,
      isVip: a.isVip,
      vipType: a.vipType,
      authorId: a.authorId,
      authorName: a.author.name || 'Vendeur',
      createdAt: a.createdAt,
      _count: { purchases: a._count.purchases },
    })));
    response.headers.set('X-Total-Count', String(total));
    return response;
  } catch (error) {
    console.error('Error fetching annonces:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des annonces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, category, emoji, type, location, authorId } = body;
    
    const annonce = await db.annonce.create({
      data: {
        title,
        price: parseInt(price),
        category,
        emoji: emoji || '📦',
        type: type || 'je_cherche',
        location: location || 'Dakar',
        authorId,
      },
    });

    return NextResponse.json({
      id: annonce.id,
      title: annonce.title,
      message: 'Annonce publiée avec succès !',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating annonce:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    );
  }
}
