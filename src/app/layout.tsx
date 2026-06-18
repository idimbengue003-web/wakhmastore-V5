import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wakhma Store - Les bonnes affaires à Dakar",
  description: "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Le marketplace #1 de Dakar, Sénégal.",
  keywords: ["Wakhma Store", "Dakar", "Sénégal", "marketplace", "annonces", "bonnes affaires"],
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
  },
  openGraph: {
    title: "Wakhma Store - Les bonnes affaires à Dakar",
    description: "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Le marketplace #1 de Dakar, Sénégal.",
    type: 'website',
    locale: 'fr_SN',
    siteName: 'Wakhma Store',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
        {/* Script pour désactiver les animations lourdes si l'utilisateur préfère reduced-motion */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              document.documentElement.classList.add('reduce-motion');
            }
          })();
        ` }} />
      </body>
    </html>
  );
}
