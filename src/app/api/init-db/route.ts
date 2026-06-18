import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/get-user';

// This route initializes the database — ADMIN ONLY
// GET /api/init-db → verify database connection and tables
// GET /api/init-db?seed=true → seed demo data (admin only)
// GET /api/init-db?reset=true → drop all tables and recreate (admin only, ⚠️ deletes all data)
//
// ⚠️ SÉCURITÉ : en production (NODE_ENV=production), les modes destructifs
// (reset + seed) sont DÉSACTIVÉS — ils peuvent dropper toutes les données ou
// créer un compte admin avec PIN trivial (backdoor). Seul le mode vérification
// (sans query params) reste disponible en prod pour diagnostiquer la DB.
export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const seedMode = request.nextUrl.searchParams.get('seed') === 'true';
  const resetMode = request.nextUrl.searchParams.get('reset') === 'true';

  // En production : bloquer reset et seed (opérations destructives/backdoor)
  if (isProduction && (seedMode || resetMode)) {
    console.error(
      `[INIT-DB] Tentative bloquée en production: ${resetMode ? 'reset' : 'seed'} ` +
      `par user ${getUserFromRequest(request)?.userId || 'inconnu'}`
    );
    return NextResponse.json(
      {
        error: 'Opération désactivée en production. Utilisez prisma migrate depuis un poste admin local.',
      },
      { status: 403 }
    );
  }

  // SECURITY: Require admin authentication for ALL operations
  const payload = getUserFromRequest(request);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès refusé. Réservé aux administrateurs.' },
      { status: 403 }
    );
  }

  const results: { step: string; status: string; error?: string }[] = [];

  try {
    if (resetMode) {
      // Drop all tables in reverse order
      const tables = ['Subscription', 'PointPurchase', 'Referral', 'Purchase', 'Annonce', 'User', '_prisma_migrations'];
      for (const table of tables) {
        try {
          await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          results.push({ step: `drop_${table}`, status: 'ok' });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          results.push({ step: `drop_${table}`, status: 'error', error: errMsg });
        }
      }

      // Recreate tables using Prisma raw SQL (PostgreSQL)
      const createStatements = [
        {
          name: 'User',
          sql: `CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT,
            "phone" TEXT,
            "password" TEXT NOT NULL,
            "image" TEXT,
            "role" TEXT NOT NULL DEFAULT 'user',
            "plan" TEXT NOT NULL DEFAULT 'none',
            "points" INTEGER NOT NULL DEFAULT 0,
            "referralCode" TEXT NOT NULL,
            "referredBy" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'User_email_key',
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
        },
        {
          name: 'User_referralCode_key',
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode")`,
        },
        {
          name: 'Annonce',
          sql: `CREATE TABLE "Annonce" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "price" INTEGER NOT NULL,
            "category" TEXT NOT NULL,
            "location" TEXT NOT NULL DEFAULT 'Dakar',
            "emoji" TEXT NOT NULL DEFAULT '📦',
            "phone" TEXT,
            "whatsapp" TEXT,
            "isVip" BOOLEAN NOT NULL DEFAULT false,
            "vipType" TEXT,
            "type" TEXT NOT NULL DEFAULT 'je_cherche',
            "authorId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'Annonce_authorId_fkey',
          sql: `ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
        {
          name: 'Purchase',
          sql: `CREATE TABLE "Purchase" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "annonceId" TEXT NOT NULL,
            "points" INTEGER NOT NULL DEFAULT 1500,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'Purchase_userId_annonceId_key',
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_userId_annonceId_key" ON "Purchase"("userId", "annonceId")`,
        },
        {
          name: 'Purchase_userId_fkey',
          sql: `ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
        {
          name: 'Purchase_annonceId_fkey',
          sql: `ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
        {
          name: 'Referral',
          sql: `CREATE TABLE "Referral" (
            "id" TEXT NOT NULL,
            "referrerId" TEXT NOT NULL,
            "referredId" TEXT NOT NULL,
            "points" INTEGER NOT NULL DEFAULT 400,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'Referral_referredId_key',
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referredId_key" ON "Referral"("referredId")`,
        },
        {
          name: 'Referral_referrerId_fkey',
          sql: `ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
        {
          name: 'Referral_referredId_fkey',
          sql: `ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        },
        {
          name: 'PointPurchase',
          sql: `CREATE TABLE "PointPurchase" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "amountFcfa" INTEGER NOT NULL,
            "pointsAdded" INTEGER NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "paymentMethod" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PointPurchase_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'PointPurchase_userId_fkey',
          sql: `ALTER TABLE "PointPurchase" ADD CONSTRAINT "PointPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
        {
          name: 'Subscription',
          sql: `CREATE TABLE "Subscription" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "plan" TEXT NOT NULL,
            "priceFcfa" INTEGER NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'active',
            "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "endDate" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: 'Subscription_userId_fkey',
          sql: `ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        },
      ];

      for (const stmt of createStatements) {
        try {
          await db.$executeRawUnsafe(stmt.sql);
          results.push({ step: stmt.name, status: 'ok' });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          results.push({ step: stmt.name, status: 'error', error: errMsg });
        }
      }

      // Also mark migrations as applied
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
            "id" TEXT NOT NULL,
            "checksum" TEXT NOT NULL,
            "finished_at" TIMESTAMP(3),
            "migration_name" TEXT NOT NULL,
            "logs" TEXT,
            "rolled_back_at" TIMESTAMP(3),
            "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
            CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
          )
        `);
        await db.$executeRawUnsafe(`INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count") VALUES ('init-pg-001', 'manual', CURRENT_TIMESTAMP, '20250610_postgresql_init', CURRENT_TIMESTAMP, 1)`);
        results.push({ step: 'prisma_migrations', status: 'ok' });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({ step: 'prisma_migrations', status: 'error', error: errMsg });
      }
    }

    // Test database connection by checking tables
    try {
      await db.user.findFirst();
      results.push({ step: 'User', status: 'ok' });
    } catch {
      results.push({ step: 'User', status: 'missing' });
    }

    try {
      await db.annonce.findFirst();
      results.push({ step: 'Annonce', status: 'ok' });
    } catch {
      results.push({ step: 'Annonce', status: 'missing' });
    }

    try {
      await db.purchase.findFirst();
      results.push({ step: 'Purchase', status: 'ok' });
    } catch {
      results.push({ step: 'Purchase', status: 'missing' });
    }

    // If seed mode and all tables exist, seed demo data
    if (seedMode) {
      const hasErrors = results.some(r => r.status === 'missing');
      if (!hasErrors) {
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
    }

    const hasErrors = results.some(r => r.status === 'missing' || r.status === 'error');
    return NextResponse.json({
      status: hasErrors ? 'incomplete' : 'ok',
      message: hasErrors
        ? 'Some tables are missing or errors occurred.'
        : 'All database tables are ready!',
      details: results,
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
