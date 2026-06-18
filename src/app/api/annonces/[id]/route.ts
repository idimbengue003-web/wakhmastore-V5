import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';

const POINTS_TO_UNLOCK = 1500;

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
    if (payload) {
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

    // Return annonce with contact info conditionally
    const result = {
      id: annonce.id,
      title: annonce.title,
      description: annonce.description,
      price: annonce.price,
      category: annonce.category,
      location: annonce.location,
      emoji: annonce.emoji,
      type: annonce.type,
      isVip: annonce.isVip,
      vipType: annonce.vipType,
      authorId: annonce.authorId,
      authorName: annonce.author.name || 'Vendeur',
      createdAt: annonce.createdAt,
      // Galerie photos complète (max 3)
      imageUrls: annonce.imageUrls,
      // Only include contact info if user has access
      phone: hasAccess ? annonce.phone : null,
      whatsapp: hasAccess ? annonce.whatsapp : null,
      hasAccess,
      unlockCost: POINTS_TO_UNLOCK,
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

// DELETE: Delete an annonce. Only the author or an admin can delete.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ));
    }

    const annonce = await db.annonce.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!annonce) {
      return securityHeaders(NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      ));
    }

    // Only author or admin can delete
    if (annonce.authorId !== payload.userId && payload.role !== 'admin') {
      return securityHeaders(NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette annonce' },
        { status: 403 }
      ));
    }

    // Delete purchases first (due to foreign key constraints), then the annonce
    await db.$transaction([
      db.purchase.deleteMany({ where: { annonceId: id } }),
      db.annonce.delete({ where: { id } }),
    ]);

    return securityHeaders(NextResponse.json({
      success: true,
      message: 'Annonce supprimée avec succès',
    }));
  } catch (error) {
    console.error('Error deleting annonce:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    ));
  }
}
