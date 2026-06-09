import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Déposer une annonce — C'est gratuit !",
  description:
    "Publiez votre demande gratuitement sur Wakhma Store. Les vendeurs de Dakar vous contacteront directement. Aucun frais pour les chercheurs.",
  alternates: { canonical: "/deposer" },
  openGraph: {
    title: "Déposer une annonce gratuite — Wakhma Store",
    description:
      "Publiez votre demande gratuitement. Les vendeurs de Dakar vous trouvent !",
  },
};

export default function DeposerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
