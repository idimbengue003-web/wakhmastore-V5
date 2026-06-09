import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This route checks and initializes the database
// Call it once after deployment: GET /api/init-db
export async function GET(request: NextRequest) {
  try {
    // Simple query to check if User table exists
    await db.user.findFirst();
    return NextResponse.json({ status: 'ok', message: 'Database is already initialized' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('does not exist')) {
      try {
        // Create tables using raw SQL (works on Vercel serverless)
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
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
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
          CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

          CREATE TABLE IF NOT EXISTS "Annonce" (
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
          );

          CREATE TABLE IF NOT EXISTS "Purchase" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "annonceId" TEXT NOT NULL,
            "points" INTEGER NOT NULL DEFAULT 1500,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_userId_annonceId_key" ON "Purchase"("userId", "annonceId");

          CREATE TABLE IF NOT EXISTS "Referral" (
            "id" TEXT NOT NULL,
            "referrerId" TEXT NOT NULL,
            "referredId" TEXT NOT NULL,
            "points" INTEGER NOT NULL DEFAULT 400,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referredId_key" ON "Referral"("referredId");

          CREATE TABLE IF NOT EXISTS "PointPurchase" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "amountFcfa" INTEGER NOT NULL,
            "pointsAdded" INTEGER NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "paymentMethod" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PointPurchase_pkey" PRIMARY KEY ("id")
          );

          CREATE TABLE IF NOT EXISTS "Subscription" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "plan" TEXT NOT NULL,
            "priceFcfa" INTEGER NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'active',
            "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "endDate" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
          );
        `);

        // Add foreign keys separately (IF NOT EXISTS not supported for constraints)
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "PointPurchase" ADD CONSTRAINT "PointPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}
        try {
          await db.$executeRawUnsafe(`
            ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          `);
        } catch {}

        return NextResponse.json({
          status: 'ok',
          message: 'Database tables created successfully!',
        });
      } catch (createError: unknown) {
        const createErrorMsg = createError instanceof Error ? createError.message : String(createError);
        return NextResponse.json({
          status: 'error',
          message: 'Failed to create tables.',
          error: createErrorMsg,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      hint: 'Check that DATABASE_URL is correctly set in your Vercel environment variables.',
      error: errorMsg,
    }, { status: 500 });
  }
}
