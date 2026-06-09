import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';

// Unlock cost based on user's subscription plan
function getUnlockCost(plan: string): number {
  switch (plan) {
    case 'diambar':
      return 1000;
    case 'vip_king':
      return 800;
    default:
      return 1500;
  }
}

// GET: Get single annonce details (phone/whatsapp only if purchased or author)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);

    const annonce = await db.annonce.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    if (!annonce) {
      return securityHeaders(NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      ));
    }

    // Check if user has purchased access or is the author
    let hasAccess = false;
    let userPlan = 'gratuit';

    if (payload) {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { plan: true },
      });
      userPlan = user?.plan || 'gratuit';

      if (payload.userId === annonce.authorId) {
        hasAccess = true;
      } else {
        const purchase = await db.purchase.findUnique({
          where: {
            userId_annonceId: {
              userId: payload.userId,
              annonceId: id,
            },
          },
        });
        hasAccess = !!purchase;
      }
    }

    // Calculate unlock cost based on user's subscription plan
    const unlockCost = getUnlockCost(userPlan);

    // Return annonce with contact info conditionally
    const result = {
      id: annonce.id,
      title: annonce.title,
      description: annonce.description,
      price: annonce.price,
      category: annonce.category,
      location: annonce.location,
      emoji: annonce.emoji,
      isVip: annonce.isVip,
      vipType: annonce.vipType,
      authorId: annonce.authorId,
      authorName: annonce.author.name || 'Vendeur',
      createdAt: annonce.createdAt,
      // Only include contact info if user has access
      phone: hasAccess ? annonce.phone : null,
      whatsapp: hasAccess ? annonce.whatsapp : null,
      hasAccess,
      unlockCost,
      userPlan,
    };

    return securityHeaders(NextResponse.json(result));
  } catch (error) {
    console.error('Error fetching annonce:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors du chargement de l\'annonce' },
      { status: 500 }
    ));
  }
}
