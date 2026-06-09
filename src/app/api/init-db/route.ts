import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// SQL statements to create all tables — each executed separately
const SQL_STATEMENTS: { name: string; sql: string }[] = [
  {
    name: 'User',
    sql: `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "phone" TEXT,
      "password" TEXT,
      "avatar" TEXT,
      "provider" TEXT NOT NULL DEFAULT 'email',
      "providerId" TEXT,
      "role" TEXT NOT NULL DEFAULT 'user',
      "plan" TEXT NOT NULL DEFAULT 'gratuit',
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
    sql: `CREATE TABLE IF NOT EXISTS "Annonce" (
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
      "authorId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
    )`,
  },
  {
    name: 'Purchase',
    sql: `CREATE TABLE IF NOT EXISTS "Purchase" (
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
    name: 'Referral',
    sql: `CREATE TABLE IF NOT EXISTS "Referral" (
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
    name: 'PointPurchase',
    sql: `CREATE TABLE IF NOT EXISTS "PointPurchase" (
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
    name: 'Subscription',
    sql: `CREATE TABLE IF NOT EXISTS "Subscription" (
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
];

// Foreign keys — errors ignored (may already exist)
const FK_STATEMENTS: { name: string; sql: string }[] = [
  {
    name: 'Annonce_authorId_fkey',
    sql: `ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
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
    name: 'Referral_referrerId_fkey',
    sql: `ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  },
  {
    name: 'Referral_referredId_fkey',
    sql: `ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
  },
  {
    name: 'PointPurchase_userId_fkey',
    sql: `ALTER TABLE "PointPurchase" ADD CONSTRAINT "PointPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  },
  {
    name: 'Subscription_userId_fkey',
    sql: `ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  },
];

// This route initializes the database
// Call it once after deployment: GET /api/init-db
export async function GET(request: NextRequest) {
  const results: { step: string; status: string; error?: string }[] = [];

  try {
    // Try to check if User table exists
    try {
      await db.user.findFirst();
      results.push({ step: 'check', status: 'User table exists' });

      // Check if all other tables exist too
      try {
        await db.annonce.findFirst();
        await db.purchase.findFirst();
        await db.referral.findFirst();
        await db.pointPurchase.findFirst();
        await db.subscription.findFirst();
        return NextResponse.json({ status: 'ok', message: 'All database tables already exist', details: results });
      } catch {
        // Some tables missing, continue to create them
      }
    } catch {
      // User table doesn't exist, continue to create all
    }

    // Create tables one by one
    for (const stmt of SQL_STATEMENTS) {
      try {
        await db.$executeRawUnsafe(stmt.sql);
        results.push({ step: stmt.name, status: 'ok' });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({ step: stmt.name, status: 'error', error: errMsg });
      }
    }

    // Add foreign keys one by one (ignore errors)
    for (const stmt of FK_STATEMENTS) {
      try {
        await db.$executeRawUnsafe(stmt.sql);
        results.push({ step: stmt.name, status: 'ok' });
      } catch {
        results.push({ step: stmt.name, status: 'skipped (may already exist)' });
      }
    }

    const hasErrors = results.some(r => r.status === 'error');
    return NextResponse.json({
      status: hasErrors ? 'partial' : 'ok',
      message: hasErrors ? 'Database initialized with some errors' : 'Database tables created successfully!',
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
