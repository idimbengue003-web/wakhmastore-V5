import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { execSync } from 'child_process';

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
        // Auto-push schema to create tables
        execSync('npx prisma db push --accept-data-loss', {
          env: { ...process.env },
          timeout: 30000,
        });
        return NextResponse.json({
          status: 'ok',
          message: 'Database tables created successfully via prisma db push',
        });
      } catch (pushError: unknown) {
        const pushErrorMsg = pushError instanceof Error ? pushError.message : String(pushError);
        return NextResponse.json({
          status: 'error',
          message: 'Failed to auto-create tables.',
          hint: 'Run manually: npx prisma db push --accept-data-loss (with DATABASE_URL set)',
          error: pushErrorMsg,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      hint: 'Check that DATABASE_URL is correctly set in your Vercel environment variables pointing to your Neon PostgreSQL database.',
      error: errorMsg,
    }, { status: 500 });
  }
}
