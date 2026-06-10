import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';
import { annonceSchema } from '@/lib/validation';
import { PLANS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build where clause using Prisma
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (type) where.type = type;
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
      type: a.type,
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

    // Authentication
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise. Connectez-vous d\'abord.' },
        { status: 401 }
      ));
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = annonceSchema.safeParse(body);
    if (!parsed.success) {
      return securityHeaders(NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      ));
    }

    const data = parsed.data;

    // Get user with plan info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, plan: true },
    });

    if (!user) {
      return securityHeaders(NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      ));
    }

    const isSubscriber = user.plan === 'gratuit' || user.plan === 'diambar' || user.plan === 'vip_king';

    // Non-subscribers can only post "je_cherche"
    if (!isSubscriber && data.type === 'je_vends') {
      return securityHeaders(NextResponse.json(
        { error: 'Vous devez être abonné pour poster une annonce "Je vends"' },
        { status: 403 }
      ));
    }

    // Check plan limits for "je_vends" annonces
    if (data.type === 'je_vends') {
      const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.none;
      const maxAnnonces = plan.annoncesPerWeek > 0 ? plan.annoncesPerWeek : plan.annoncesPerMonth;

      if (maxAnnonces > 0) {
        const now = new Date();
        let startDate: Date;

        if (plan.annoncesPerWeek > 0) {
          // Weekly limit
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
        } else {
          // Monthly limit
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
        }

        const userAnnonceCount = await db.annonce.count({
          where: {
            authorId: user.id,
            type: 'je_vends',
            createdAt: { gte: startDate },
          },
        });

        if (userAnnonceCount >= maxAnnonces) {
          return securityHeaders(NextResponse.json(
            { error: `Limite atteinte : ${maxAnnonces} annonces "Je vends" par ${plan.annoncesPerWeek > 0 ? 'semaine' : 'mois'}. Passez à un plan supérieur !` },
            { status: 403 }
          ));
        }
      }
    }

    // Determine VIP status
    const isVip = user.plan === 'diambar' || user.plan === 'vip_king';
    const vipType = user.plan === 'vip_king' ? 'vip_king' : user.plan === 'diambar' ? 'diambar' : null;

    // Create annonce
    const annonce = await db.annonce.create({
      data: {
        title: data.title,
        description: data.description || null,
        price: data.price,
        category: data.category,
        location: data.location,
        emoji: data.emoji,
        type: data.type,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        isVip,
        vipType,
        authorId: user.id,
      },
    });

    return securityHeaders(NextResponse.json({
      id: annonce.id,
      title: annonce.title,
      type: annonce.type,
      message: 'Annonce publiée avec succès !',
    }, { status: 201 }));
  } catch (error) {
    console.error('Error creating annonce:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    ));
  }
}
