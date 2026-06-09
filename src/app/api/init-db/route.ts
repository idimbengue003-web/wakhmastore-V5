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
      return NextResponse.json({
        status: 'error',
        message: 'Database tables do not exist.',
        hint: '1) Make sure DATABASE_URL is set in Vercel environment variables. 2) Run: npx prisma db push --accept-data-loss (locally with the Neon DATABASE_URL)',
        error: errorMsg,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      hint: 'Check that DATABASE_URL is correctly set in your Vercel environment variables pointing to your Neon PostgreSQL database.',
      error: errorMsg,
    }, { status: 500 });
  }
}
