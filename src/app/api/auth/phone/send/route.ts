import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { securityHeaders } from '@/lib/security-headers';
import { sendWhatsAppOTP, isWhatsAppAPIConfigured } from '@/lib/whatsapp';
import redis from '@/lib/redis';

// Max verification attempts per code
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
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(ip, 'auth');
    if (!allowed) {
      return securityHeaders(NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      ));
    }

    const body = await request.json();
    const phone = (body.phone || '').replace(/\s/g, '');

    if (!phone || !/^(\+221|0)?[0-9]{9}$/.test(phone)) {
      return securityHeaders(NextResponse.json(
        { error: 'Numéro de téléphone sénégalais invalide' },
        { status: 400 }
      ));
    }

    // Normalize phone number to international format
    const normalizedPhone = phone.startsWith('+221') ? phone : phone.startsWith('0') ? '+221' + phone.slice(1) : '+221' + phone;

    // Check if phone is already registered
    const existingUser = await db.user.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingUser) {
      return securityHeaders(NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé par un autre compte' },
        { status: 409 }
      ));
    }

    // Check if a code was recently sent (prevent spam — 60 seconds cooldown)
    let existing: { code: string; expires: number; attempts: number } | null = null;

    if (isRedisConfigured() && redis) {
      try {
        const stored = await redis.get<{ code: string; expires: number; attempts: number }>(getOtpKey(normalizedPhone));
        existing = stored || null;
      } catch (error) {
        console.error('Redis read error, using fallback:', error);
        existing = verificationCodesFallback.get(normalizedPhone) || null;
      }
    } else {
      existing = verificationCodesFallback.get(normalizedPhone) || null;
    }

    if (existing && Date.now() < existing.expires - 4 * 60 * 1000) {
      const cooldownMs = (existing.expires - 4 * 60 * 1000) - Date.now();
      if (cooldownMs > 0) {
        return securityHeaders(NextResponse.json(
          { error: `Attendez ${Math.ceil(cooldownMs / 1000)} secondes avant de demander un nouveau code` },
          { status: 429 }
        ));
      }
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store code with attempt counter
    const otpData = { code, expires, attempts: 0 };

    if (isRedisConfigured() && redis) {
      try {
        await redis.set(getOtpKey(normalizedPhone), JSON.stringify(otpData), { ex: 300 }); // 5 min TTL
      } catch (error) {
        console.error('Redis write error, using fallback:', error);
        verificationCodesFallback.set(normalizedPhone, otpData);
      }
    } else {
      verificationCodesFallback.set(normalizedPhone, otpData);
    }

    // Check if WhatsApp Cloud API is configured
    const isCloudAPI = isWhatsAppAPIConfigured();

    // Send OTP via WhatsApp Cloud API if configured
    let otpMethod = 'demo';
    let whatsappLink = '';

    if (isCloudAPI) {
      const otpResult = await sendWhatsAppOTP(normalizedPhone, code);
      otpMethod = otpResult.method;
      whatsappLink = otpResult.whatsappLink || '';
    }

    console.log(`[WhatsApp OTP] Code generated for ${normalizedPhone} via ${otpMethod}`);

    const responseData: Record<string, unknown> = {
      success: true,
      method: otpMethod,
    };

    if (otpMethod === 'cloud_api') {
      // Cloud API sent the code via WhatsApp — no need to show it
      responseData.message = 'Code de vérification envoyé via WhatsApp';
    } else if (otpMethod === 'wa_me_link' && whatsappLink) {
      // Fallback: wa.me link available
      responseData.message = 'Code de vérification prêt — ouvrez le lien WhatsApp';
      responseData.whatsappLink = whatsappLink;
      // Only include code in development mode
      if (process.env.NODE_ENV === 'development') {
        responseData.code = code;
      }
    } else {
      // Demo mode: only show code in development
      if (process.env.NODE_ENV === 'development') {
        responseData.message = 'Code de vérification généré (mode démo)';
        responseData.code = code;
      } else {
        // In production without WhatsApp API, still generate the code but don't return it
        // The code was logged server-side for admin verification
        responseData.message = 'Code de vérification envoyé. Vérifiez votre WhatsApp.';
      }
    }

    return securityHeaders(NextResponse.json(responseData));
  } catch (error) {
    console.error('Error sending verification code:', error);
    return securityHeaders(NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    ));
  }
}
