import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563EB",
};

export const metadata: Metadata = {
  title: {
    default: "Wakhma Store — Les bonnes affaires à Dakar, Sénégal",
    template: "%s | Wakhma Store",
  },
  description:
    "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Marketplace inversé #1 à Dakar, Sénégal. Annonces gratuites, téléphones, TV, électroménager, immobilier et plus.",
  keywords: [
    "Wakhma Store",
    "Dakar",
    "Sénégal",
    "marketplace",
    "annonces",
    "bonnes affaires",
    "petites annonces",
    "achat",
    "vente",
    "téléphone",
    "électroménager",
    "immobilier",
    "Dakar annonces",
    "Sénégal marketplace",
    "annonce gratuite",
  ],
  authors: [{ name: "Wakhma Store", url: "https://wakhmastore.com" }],
  creator: "Wakhma Store",
  publisher: "Wakhma Store",
  metadataBase: new URL("https://wakhmastore.com"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-SN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "https://wakhmastore.com",
    siteName: "Wakhma Store",
    title: "Wakhma Store — Les bonnes affaires à Dakar, Sénégal",
    description:
      "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Le marketplace inversé #1 de Dakar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wakhma Store — Marketplace inversé à Dakar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakhma Store — Les bonnes affaires à Dakar",
    description:
      "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Marketplace inversé #1 de Dakar, Sénégal.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://vercel.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
