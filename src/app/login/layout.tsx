import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Se connecter ou créer un compte",
  description:
    "Connectez-vous à Wakhma Store ou créez un compte gratuit. Accédez aux annonces de Dakar et trouvez les meilleures affaires du Sénégal.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
