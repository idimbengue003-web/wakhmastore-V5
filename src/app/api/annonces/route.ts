import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { annonceSchema } from '@/lib/validation';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

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
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { isVip: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Remove sensitive contact info from list view
    const safeAnnonces = annonces.map(({ phone, whatsapp, ...rest }) => rest);

    return securityHeaders(NextResponse.json(safeAnnonces));
  } catch (error) {
    console.error('Error fetching annonces:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement des annonces' },
      { status: 500 }
    ));
  }
}

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

    // Input validation
    const result = annonceSchema.safeParse({
      ...body,
      price: typeof body.price === 'string' ? parseInt(body.price) : body.price,
    });
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return securityHeaders(NextResponse.json(
        { error: errors },
        { status: 400 }
      ));
    }

    const { title, description, price, category, location, emoji, phone, whatsapp } = result.data;

    // Check user plan — add "Je vends" prefix for gratuit users
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { plan: true },
    });
    const finalTitle = (user?.plan === 'gratuit' || !user?.plan) && !title.toLowerCase().startsWith('je vends')
      ? `Je vends ${title}`
      : title;

    const annonce = await db.annonce.create({
      data: {
        title: finalTitle,
        description,
        price,
        category,
        location: location || 'Dakar',
        emoji: emoji || '📦',
        phone: phone || null,
        whatsapp: whatsapp || null,
        isVip: body.isVip || false,
        vipType: body.vipType || null,
        authorId: payload.userId,
      },
    });

    return securityHeaders(NextResponse.json(annonce, { status: 201 }));
  } catch (error) {
    console.error('Error creating annonce:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    ));
  }
}
