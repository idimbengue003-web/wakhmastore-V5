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
      </body>
    </html>
  );
}
