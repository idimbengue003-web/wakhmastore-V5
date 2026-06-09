import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annonces — Parcourez les demandes à Dakar",
  description:
    "Parcourez les annonces de Dakar. Téléphones, TV, électroménager, immobilier, meubles et plus. Trouvez ce que vous cherchez sur Wakhma Store.",
  alternates: { canonical: "/annonces" },
  openGraph: {
    title: "Annonces — Wakhma Store Dakar",
    description:
      "Parcourez les annonces de Dakar. Trouvez ce que vous cherchez sur Wakhma Store.",
  },
};

export default function AnnoncesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
