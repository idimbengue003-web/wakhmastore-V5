import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';
import { securityHeaders } from '@/lib/security-headers';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().refine(
    (val) => /^(\+221|0)?[0-9]{9}$/.test(val.replace(/\s/g, '')),
    'Numéro de téléphone sénégalais invalide'
  ),
});

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return securityHeaders(NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const result = phoneSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((e: { message: string }) => e.message).join(', ');
      return securityHeaders(NextResponse.json(
        { error: errors },
        { status: 400 }
      ));
    }

    const cleanPhone = result.data.phone.replace(/\s/g, '');

    await db.user.update({
      where: { id: payload.userId },
      data: { phone: cleanPhone },
    });

    const updatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        plan: true, points: true, referralCode: true, image: true,
      },
    });

    return securityHeaders(NextResponse.json({
      success: true,
      message: 'Numéro de téléphone enregistré',
      user: updatedUser,
    }));
  } catch (error) {
    console.error('Error updating phone:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    ));
  }
}
