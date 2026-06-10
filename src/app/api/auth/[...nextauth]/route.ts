import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { generateToken, generateReferralCode } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Update user profile image if provided
          if (user.image && !existingUser.image) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                image: user.image,
                emailVerified: new Date(),
              },
            });
          }

          // Link OAuth account if not already linked
          if (account) {
            const existingAccount = existingUser.accounts.find(
              (a) => a.provider === account.provider
            );
            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                },
              });
            } else {
              // Update tokens
              await db.account.update({
                where: { id: existingAccount.id },
                data: {
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                },
              });
            }
          }
        } else {
          // Create new user
          let referralCode = generateReferralCode();
          let codeExists = await db.user.findUnique({ where: { referralCode } });
          while (codeExists) {
            referralCode = generateReferralCode();
            codeExists = await db.user.findUnique({ where: { referralCode } });
          }

          const newUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.image,
              emailVerified: new Date(),
              referralCode,
            },
          });

          // Create OAuth account link
          if (account) {
            await db.account.create({
              data: {
                userId: newUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at,
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error('OAuth signIn error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // On first sign in, add our custom JWT data
      if (user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            plan: true,
            points: true,
            phone: true,
            referralCode: true,
            image: true,
          },
        });

        if (dbUser) {
          // Generate our custom JWT token for the existing auth system
          const customToken = generateToken({
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
          });

          token.customToken = customToken;
          token.customUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role,
            plan: dbUser.plan,
            points: dbUser.points,
            referralCode: dbUser.referralCode,
            image: dbUser.image,
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Pass our custom data to the session
      if (token.customUser) {
        session.customToken = token.customToken as string;
        session.customUser = token.customUser as {
          id: string;
          name: string | null;
          email: string;
          phone: string | null;
          role: string;
          plan: string;
          points: number;
          referralCode: string;
          image: string | null;
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
