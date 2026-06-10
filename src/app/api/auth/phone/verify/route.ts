import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityHeaders } from '@/lib/security-headers';
import { verificationCodes } from '../send/route';

const MAX_VERIFY_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = (body.phone || '').replace(/\s/g, '');
    const code = (body.code || '').trim();

    if (!phone || !code) {
      return securityHeaders(NextResponse.json(
        { error: 'Numéro et code requis' },
        { status: 400 }
      ));
    }

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+221') ? phone : phone.startsWith('0') ? '+221' + phone.slice(1) : '+221' + phone;

    // Check stored code
    const stored = verificationCodes.get(normalizedPhone);

    if (!stored) {
      return securityHeaders(NextResponse.json(
        { error: 'Aucun code n\'a été envoyé à ce numéro. Demandez un nouveau code.' },
        { status: 400 }
      ));
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      verificationCodes.delete(normalizedPhone);
      return securityHeaders(NextResponse.json(
        { error: 'Le code a expiré. Demandez un nouveau code.' },
        { status: 400 }
      ));
    }

    // Check attempt limit
    if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
      verificationCodes.delete(normalizedPhone);
      return securityHeaders(NextResponse.json(
        { error: `Trop de tentatives incorrectes (${MAX_VERIFY_ATTEMPTS} max). Demandez un nouveau code.` },
        { status: 429 }
      ));
    }

    // Increment attempt counter
    stored.attempts++;

    // Check code match
    if (stored.code !== code) {
      const remaining = MAX_VERIFY_ATTEMPTS - stored.attempts;
      return securityHeaders(NextResponse.json(
        { error: `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.` },
        { status: 400 }
      ));
    }

    // Code is valid — remove it so it can't be reused
    verificationCodes.delete(normalizedPhone);

    // Check if phone is already registered (double check)
    const existingUser = await db.user.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingUser) {
      return securityHeaders(NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé par un autre compte' },
        { status: 409 }
      ));
    }

    return securityHeaders(NextResponse.json({
      success: true,
      message: 'Numéro vérifié avec succès',
    }));
  } catch (error) {
    console.error('Error verifying code:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    ));
  }
}
