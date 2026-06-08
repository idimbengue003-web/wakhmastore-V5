import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.title = { contains: search };
    }

    const annonces = await db.annonce.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: [
        { isVip: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(annonces);
  } catch (error) {
    console.error('Error fetching annonces:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des annonces' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, category, location, emoji, authorId, isVip, vipType } = body;

    if (!title || !price || !category || !authorId) {
      return NextResponse.json(
        { error: 'Titre, prix, catégorie et auteur sont requis' },
        { status: 400 }
      );
    }

    const annonce = await db.annonce.create({
      data: {
        title,
        description,
        price: parseInt(price),
        category,
        location: location || 'Dakar',
        emoji: emoji || '📦',
        isVip: isVip || false,
        vipType: vipType || null,
        authorId,
      },
    });

    return NextResponse.json(annonce, { status: 201 });
  } catch (error) {
    console.error('Error creating annonce:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'annonce' }, { status: 500 });
  }
}
