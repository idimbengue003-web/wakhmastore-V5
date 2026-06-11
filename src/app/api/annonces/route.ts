import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';

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
      phone: a.phone,
      whatsapp: a.whatsapp,
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
    // AUTH REQUIRED — get user from JWT token (httpOnly cookie or Authorization header)
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour déposer une annonce' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, category, emoji, type, location, phone, whatsapp } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { error: 'Titre, prix et catégorie sont obligatoires' },
        { status: 400 }
      );
    }

    // Use the authenticated user's ID from the token — never trust client-sent authorId
    const authorId = payload.userId;

    // Check user's annonce limit based on plan
    const user = await db.user.findUnique({
      where: { id: authorId },
      select: { plan: true, _count: { select: { annonces: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    // Free users can only post "je_cherche"
    const isSubscriber = user.plan === 'gratuit' || user.plan === 'diambar' || user.plan === 'vip_king';
    const annonceType = isSubscriber ? (type || 'je_cherche') : 'je_cherche';

    const annonce = await db.annonce.create({
      data: {
        title,
        description: description || null,
        price: parseInt(String(price)),
        category,
        emoji: emoji || '📦',
        type: annonceType,
        location: location || 'Dakar',
        phone: phone || null,
        whatsapp: whatsapp || null,
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
