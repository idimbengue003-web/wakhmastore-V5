import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, generateReferralCode, hashPassword } from '@/lib/auth';
import { MAX_REFERRAL_POINTS, POINTS_PER_REFERRAL } from '@/lib/constants';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`
  : 'http://localhost:3000/api/auth/facebook/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '';
    const error = searchParams.get('error');

    if (error || !code) {
      return NextResponse.redirect(new URL('/login?oauth=error', request.url));
    }

    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
        code,
        client_id: FACEBOOK_CLIENT_ID,
        client_secret: FACEBOOK_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      })}`
    );

    if (!tokenRes.ok) {
      console.error('Facebook token exchange failed');
      return NextResponse.redirect(new URL('/login?oauth=error', request.url));
    }

    const tokenData = await tokenRes.json();
    const { access_token } = tokenData;

    // Get user info from Facebook
    const userInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${access_token}`
    );

    if (!userInfoRes.ok) {
      console.error('Facebook userinfo fetch failed');
      return NextResponse.redirect(new URL('/login?oauth=error', request.url));
    }

    const fbUser = await userInfoRes.json();
    const { name, email, picture } = fbUser;

    if (!email) {
      return NextResponse.redirect(new URL('/login?oauth=noemail', request.url));
    }

    const avatarUrl = picture?.data?.url || null;

    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = await hashPassword(Math.random().toString(36).slice(-16) + 'A1!');

      let userReferralCode = generateReferralCode();
      let codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
      while (codeExists) {
        userReferralCode = generateReferralCode();
        codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
      }

      let referredBy: string | null = null;
      if (state) {
        const referrer = await db.user.findUnique({ where: { referralCode: state } });
        if (referrer) referredBy = referrer.id;
      }

      user = await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: randomPassword,
          image: avatarUrl,
          referralCode: userReferralCode,
          referredBy: referredBy,
        },
      });

      if (referredBy) {
        const referrer = await db.user.findUnique({ where: { id: referredBy } });
        if (referrer) {
          const currentReferralPoints = await db.referral.aggregate({
            where: { referrerId: referredBy },
            _sum: { points: true },
          });
          const totalPoints = currentReferralPoints._sum.points || 0;
          if (totalPoints < MAX_REFERRAL_POINTS) {
            const pointsToAdd = Math.min(POINTS_PER_REFERRAL, MAX_REFERRAL_POINTS - totalPoints);
            await db.referral.create({
              data: { referrerId: referredBy, referredId: user.id, points: pointsToAdd },
            });
            await db.user.update({
              where: { id: referredBy },
              data: { points: referrer.points + pointsToAdd },
            });
          }
        }
      }
    } else {
      if (!user.image) {
        await db.user.update({
          where: { id: user.id },
          data: { image: avatarUrl || user.image },
        });
        user = { ...user, image: avatarUrl || user.image };
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      points: user.points,
      referralCode: user.referralCode,
      image: user.image,
    };

    // Set token in httpOnly cookie instead of URL params for security
    const response = NextResponse.redirect(new URL('/auth/callback', request.url));
    response.cookies.set('wakhma_oauth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // Short-lived: 1 minute to complete callback
      path: '/',
    });
    response.cookies.set('wakhma_oauth_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?oauth=error', request.url));
  }
}
