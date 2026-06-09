import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recharger — Points & Abonnements",
  description:
    "Rechargez votre compte Wakhma Store. Achetez des points ou souscrivez un abonnement pour maximiser votre expérience.",
  alternates: { canonical: "/recharge" },
};

export default function RechargeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
