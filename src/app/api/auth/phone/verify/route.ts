import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityHeaders } from '@/lib/security-headers';
import redis from '@/lib/redis';

const MAX_VERIFY_ATTEMPTS = 3;

// OTP storage key prefix for Redis
const OTP_KEY_PREFIX = 'otp:';

// In-memory fallback for local dev (when no Redis configured)
const verificationCodesFallback = new Map<string, { code: string; expires: number; attempts: number }>();

function getOtpKey(phone: string): string {
  return `${OTP_KEY_PREFIX}${phone}`;
}

// Check if Redis is configured
function isRedisConfigured(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL;
}

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

    // Check stored code — try Redis first, then in-memory fallback
    let stored: { code: string; expires: number; attempts: number } | null = null;
    const otpKey = getOtpKey(normalizedPhone);

    if (isRedisConfigured()) {
      try {
        const raw = await redis.get<string>(otpKey);
        if (raw) {
          // Redis may return the parsed object directly or as a string
          stored = typeof raw === 'string' ? JSON.parse(raw) : raw as unknown as { code: string; expires: number; attempts: number };
        }
      } catch (error) {
        console.error('Redis read error, using fallback:', error);
        stored = verificationCodesFallback.get(normalizedPhone) || null;
      }
    } else {
      stored = verificationCodesFallback.get(normalizedPhone) || null;
    }

    if (!stored) {
      return securityHeaders(NextResponse.json(
        { error: 'Aucun code n\'a été envoyé à ce numéro. Demandez un nouveau code.' },
        { status: 400 }
      ));
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      if (isRedisConfigured()) {
        try { await redis.del(otpKey); } catch { /* ignore */ }
      }
      verificationCodesFallback.delete(normalizedPhone);
      return securityHeaders(NextResponse.json(
        { error: 'Le code a expiré. Demandez un nouveau code.' },
        { status: 400 }
      ));
    }

    // Check attempt limit
    if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
      if (isRedisConfigured()) {
        try { await redis.del(otpKey); } catch { /* ignore */ }
      }
      verificationCodesFallback.delete(normalizedPhone);
      return securityHeaders(NextResponse.json(
        { error: `Trop de tentatives incorrectes (${MAX_VERIFY_ATTEMPTS} max). Demandez un nouveau code.` },
        { status: 429 }
      ));
    }

    // Increment attempt counter
    stored.attempts++;

    // Save updated attempt count
    if (isRedisConfigured()) {
      try {
        // Calculate remaining TTL in seconds (at least 1)
        const ttlSec = Math.max(1, Math.ceil((stored.expires - Date.now()) / 1000));
        await redis.set(otpKey, JSON.stringify(stored), { ex: ttlSec });
      } catch (error) {
        console.error('Redis write error, using fallback:', error);
        verificationCodesFallback.set(normalizedPhone, stored);
      }
    } else {
      verificationCodesFallback.set(normalizedPhone, stored);
    }

    // Check code match
    if (stored.code !== code) {
      const remaining = MAX_VERIFY_ATTEMPTS - stored.attempts;
      return securityHeaders(NextResponse.json(
        { error: `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.` },
        { status: 400 }
      ));
    }

    // Code is valid — remove it so it can't be reused
    if (isRedisConfigured()) {
      try { await redis.del(otpKey); } catch { /* ignore */ }
    }
    verificationCodesFallback.delete(normalizedPhone);

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
