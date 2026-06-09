import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parrainage — Gagnez 400 points par filleul",
  description:
    "Invitez vos amis sur Wakhma Store et gagnez 400 points par filleul, jusqu'à 30 000 points ! Partagez votre code de parrainage maintenant.",
  alternates: { canonical: "/parrainage" },
  openGraph: {
    title: "Programme de parrainage — Wakhma Store",
    description:
      "Gagnez 400 points par filleul sur Wakhma Store. Jusqu'à 30 000 points !",
  },
};

export default function ParrainageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
