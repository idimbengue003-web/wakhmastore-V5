import 'next-auth';

declare module 'next-auth' {
  interface Session {
    customToken?: string;
    customUser?: {
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
}

declare module 'next-auth/jwt' {
  interface JWT {
    customToken?: string;
    customUser?: {
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
}
