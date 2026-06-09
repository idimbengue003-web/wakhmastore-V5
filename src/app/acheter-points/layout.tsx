import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acheter des points — Rechargez votre compte",
  description:
    "Achetez des points Wakhma Store pour débloquer les coordonnées des vendeurs. Packs Starter, Standard, Premium et Ultimate. Paiement Wave, Orange Money, virement.",
  alternates: { canonical: "/acheter-points" },
  openGraph: {
    title: "Acheter des points — Wakhma Store",
    description:
      "Rechargez votre compte pour débloquer les coordonnées des vendeurs à Dakar.",
  },
};

export default function AcheterPointsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
