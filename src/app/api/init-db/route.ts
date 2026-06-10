import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This route initializes the database
// GET /api/init-db → verify database connection and tables exist
// GET /api/init-db?seed=true → also seed demo data
export async function GET(request: NextRequest) {
  const results: { step: string; status: string; error?: string }[] = [];
  const seedMode = request.nextUrl.searchParams.get('seed') === 'true';

  try {
    // Test database connection by checking tables
    try {
      await db.user.findFirst();
      results.push({ step: 'User', status: 'ok' });
    } catch {
      results.push({ step: 'User', status: 'missing', error: 'Table does not exist. Run: npx prisma migrate deploy' });
    }

    try {
      await db.annonce.findFirst();
      results.push({ step: 'Annonce', status: 'ok' });
    } catch {
      results.push({ step: 'Annonce', status: 'missing', error: 'Table does not exist' });
    }

    try {
      await db.purchase.findFirst();
      results.push({ step: 'Purchase', status: 'ok' });
    } catch {
      results.push({ step: 'Purchase', status: 'missing', error: 'Table does not exist' });
    }

    try {
      await db.referral.findFirst();
      results.push({ step: 'Referral', status: 'ok' });
    } catch {
      results.push({ step: 'Referral', status: 'missing', error: 'Table does not exist' });
    }

    try {
      await db.pointPurchase.findFirst();
      results.push({ step: 'PointPurchase', status: 'ok' });
    } catch {
      results.push({ step: 'PointPurchase', status: 'missing', error: 'Table does not exist' });
    }

    try {
      await db.subscription.findFirst();
      results.push({ step: 'Subscription', status: 'ok' });
    } catch {
      results.push({ step: 'Subscription', status: 'missing', error: 'Table does not exist' });
    }

    const hasErrors = results.some(r => r.status === 'missing');

    // If seed mode and all tables exist, seed demo data
    if (seedMode && !hasErrors) {
      const userCount = await db.user.count();
      if (userCount === 0) {
        const { hashPassword } = await import('@/lib/auth');
        const hashedPin = await hashPassword('1234');

        await db.user.createMany({
          data: [
            { email: 'demo@wakhma.sn', name: 'Démo Wakhma', phone: '+22177000000', password: hashedPin, role: 'admin', plan: 'vip_king', points: 50000, referralCode: 'DEMO001' },
            { email: 'fatou@test.sn', name: 'Fatou Diallo', phone: '+22177111111', password: hashedPin, plan: 'gratuit', points: 2000, referralCode: 'FATOU01' },
            { email: 'mamadou@test.sn', name: 'Mamadou Sow', phone: '+22177222222', password: hashedPin, plan: 'diambar', points: 15000, referralCode: 'MAMAD01' },
          ],
        });
        results.push({ step: 'seed', status: 'ok' });
      } else {
        results.push({ step: 'seed', status: 'skipped', error: 'Database already has data' });
      }
    }

    return NextResponse.json({
      status: hasErrors ? 'incomplete' : 'ok',
      message: hasErrors
        ? 'Some tables are missing. Run: npx prisma migrate deploy'
        : 'All database tables are ready!',
      details: results,
      hint: hasErrors ? 'Make sure DATABASE_URL points to a PostgreSQL database and migrations have been applied.' : undefined,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      hint: 'Check that DATABASE_URL is correctly set in your Vercel environment variables.',
      error: errorMsg,
    }, { status: 500 });
  }
}
