import type { Metadata } from "next";

const BASE_URL = "https://wakhmastore.com";

export const siteConfig = {
  name: "Wakhma Store",
  url: BASE_URL,
  description:
    "Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Marketplace inversé #1 à Dakar, Sénégal.",
};

export const pageMetadata: Record<string, Metadata> = {
  annonces: {
    title: "Annonces — Parcourez les demandes à Dakar",
    description:
      "Parcourez les annonces de Dakar. Téléphones, TV, électroménager, immobilier, meubles et plus. Trouvez ce que vous cherchez sur Wakhma Store.",
    alternates: { canonical: "/annonces" },
    openGraph: {
      title: "Annonces — Wakhma Store Dakar",
      description:
        "Parcourez les annonces de Dakar. Trouvez ce que vous cherchez sur Wakhma Store.",
      url: `${BASE_URL}/annonces`,
    },
  },

  deposer: {
    title: "Déposer une annonce — C'est gratuit !",
    description:
      "Publiez votre demande gratuitement sur Wakhma Store. Les vendeurs de Dakar vous contacteront directement. Aucun frais pour les chercheurs.",
    alternates: { canonical: "/deposer" },
    openGraph: {
      title: "Déposer une annonce gratuite — Wakhma Store",
      description:
        "Publiez votre demande gratuitement. Les vendeurs de Dakar vous trouvent !",
      url: `${BASE_URL}/deposer`,
    },
  },

  login: {
    title: "Connexion — Se connecter ou créer un compte",
    description:
      "Connectez-vous à Wakhma Store ou créez un compte gratuit. Accédez aux annonces de Dakar et trouvez les meilleures affaires du Sénégal.",
    alternates: { canonical: "/login" },
  },

  "acheter-points": {
    title: "Acheter des points — Rechargez votre compte",
    description:
      "Achetez des points Wakhma Store pour débloquer les coordonnées des vendeurs. Packs Starter, Standard, Premium et Ultimate. Paiement Wave ou Orange Money.",
    alternates: { canonical: "/acheter-points" },
    openGraph: {
      title: "Acheter des points — Wakhma Store",
      description:
        "Rechargez votre compte pour débloquer les coordonnées des vendeurs à Dakar.",
      url: `${BASE_URL}/acheter-points`,
    },
  },

  abonnements: {
    title: "Abonnements — BOLT ⚡, DIAMBAR & VIP KING",
    description:
      "Abonnez-vous à Wakhma Store et économisez sur le débloquage des annonces. BOLT ⚡ à 2 000 F/mois, DIAMBAR à 5 000 F/mois ou VIP KING à 9 900 F/mois.",
    alternates: { canonical: "/abonnements" },
    openGraph: {
      title: "Abonnements BOLT ⚡, DIAMBAR & VIP KING — Wakhma Store",
      description:
        "Économisez sur le débloquage des annonces avec un abonnement Wakhma Store.",
      url: `${BASE_URL}/abonnements`,
    },
  },

  parrainage: {
    title: "Parrainage — Gagnez 400 points par filleul",
    description:
      "Invitez vos amis sur Wakhma Store et gagnez 400 points par filleul, jusqu'à 30 000 points ! Partagez votre code de parrainage maintenant.",
    alternates: { canonical: "/parrainage" },
    openGraph: {
      title: "Programme de parrainage — Wakhma Store",
      description:
        "Gagnez 400 points par filleul sur Wakhma Store. Jusqu'à 30 000 points !",
      url: `${BASE_URL}/parrainage`,
    },
  },

  cgu: {
    title: "Conditions générales d'utilisation",
    description:
      "Conditions générales d'utilisation de Wakhma Store. Règles d'utilisation, système de points, abonnements, paiements et droit applicable sénégalais.",
    alternates: { canonical: "/cgu" },
  },

  "mentions-legales": {
    title: "Mentions légales",
    description:
      "Mentions légales de Wakhma Store. Éditeur, hébergement, propriété intellectuelle, responsabilité et contact.",
    alternates: { canonical: "/mentions-legales" },
  },

  confidentialite: {
    title: "Politique de confidentialité",
    description:
      "Politique de confidentialité de Wakhma Store. Données collectées, droits des utilisateurs, sécurité, cookies. Conforme à la loi sénégalaise.",
    alternates: { canonical: "/confidentialite" },
  },

  recharge: {
    title: "Recharger — Points & Abonnements",
    description:
      "Rechargez votre compte Wakhma Store. Achetez des points ou souscrivez un abonnement pour maximiser votre expérience.",
    alternates: { canonical: "/recharge" },
  },
};
