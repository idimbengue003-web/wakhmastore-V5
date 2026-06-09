import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnements — Diambar & VIP KING",
  description:
    "Abonnez-vous à Wakhma Store et économisez sur le débloquage des annonces. Diambar à 2 000 F/mois (-33%) ou VIP KING à 5 000 F/mois (-47%).",
  alternates: { canonical: "/abonnements" },
  openGraph: {
    title: "Abonnements Diambar & VIP KING — Wakhma Store",
    description:
      "Économisez sur le débloquage des annonces avec un abonnement Wakhma Store.",
  },
};

export default function AbonnementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
