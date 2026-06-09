import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`
  : 'http://localhost:3000/api/auth/facebook/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get('ref') || '';

  const params = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'email,public_profile',
    state: ref,
  });

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
}
