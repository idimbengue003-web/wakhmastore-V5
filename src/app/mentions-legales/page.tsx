import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales de Wakhma Store. Éditeur, hébergement Vercel, propriété intellectuelle, responsabilité et contact.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <h1 className="text-lg font-bold text-gray-900 mb-5 heading-compact">
          Mentions légales
        </h1>

        <div className="space-y-5">
          {/* 1. Éditeur du site */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              1. Éditeur du site
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Le site <strong>Wakhma Store</strong> (ci-après « le Site ») est édité par Wakhma Store SARL, société à responsabilité limitée immatriculée au Sénégal, dont le siège social est situé à Dakar, Sénégal.
              </p>
              <p>
                Email : <Link href="mailto:contact@wakhmastore.com" className="text-orange hover:underline">contact@wakhmastore.com</Link>
              </p>
              <p>
                WhatsApp : Disponible via le bouton de contact intégré au Site
              </p>
              <p>
                Capital social : [à déterminer]
              </p>
              <p>
                Numéro RCCM : [à déterminer]
              </p>
              <p>
                NINEA : [à déterminer]
              </p>
            </div>
          </section>

          {/* 2. Directeur de la publication */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              2. Directeur de la publication
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Le directeur de la publication du Site est [Nom du directeur], en sa qualité de représentant légal de la société Wakhma Store SARL.
              </p>
            </div>
          </section>

          {/* 3. Hébergement */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              3. Hébergement
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Le Site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis d&apos;Amérique.
              </p>
              <p>
                Site web :{' '}
                <Link href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">
                  https://vercel.com
                </Link>
              </p>
              <p>
                Téléphone : +1 (628) 246-2836
              </p>
            </div>
          </section>

          {/* 4. Base de données */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              4. Base de données
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Les données du Site sont stockées au moyen de <strong>Neon PostgreSQL</strong>, une base de données serverless hébergée sur les infrastructures Amazon Web Services (AWS). Les données peuvent être stockées dans des centres de données situés au sein de l&apos;Union européenne et/ou des États-Unis d&apos;Amérique, conformément aux réglementations applicables en matière de protection des données.
              </p>
            </div>
          </section>

          {/* 5. Technologies utilisées */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              5. Technologies utilisées
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>Le Site est développé avec les technologies suivantes :</p>
              <ul className="list-disc list-inside space-y-0.5 pl-2">
                <li>Next.js 16 — Framework React pour le rendu côté serveur</li>
                <li>React — Bibliothèque JavaScript pour la construction d&apos;interfaces utilisateur</li>
                <li>TypeScript — Langage de programmation typé</li>
                <li>Tailwind CSS — Framework CSS utilitaire</li>
                <li>Prisma ORM — Outil de mappage objet-relationnel pour la base de données</li>
                <li>Vercel — Plateforme de déploiement et d&apos;hébergement</li>
              </ul>
            </div>
          </section>

          {/* 6. Propriété intellectuelle */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              6. Propriété intellectuelle
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                L&apos;ensemble des éléments composant le Site, incluant mais sans s&apos;y limiter les textes, images, graphismes, logos, icônes, sons, logiciels, design, mise en page et structure générale, est la propriété exclusive de Wakhma Store SARL ou de ses partenaires et est protégé par les lois sénégalaises et internationales relatives à la propriété intellectuelle, notamment la loi n° 2008-09 du 25 juillet 2008 sur la propriété intellectuelle au Sénégal et les conventions internationales pertinentes.
              </p>
              <p>
                Toute reproduction, représentation, modification, distribution ou exploitation, même partielle, de tout ou partie des éléments du Site, par quelque procédé que ce soit, sans l&apos;autorisation écrite préalable de Wakhma Store SARL, est strictement interdite et constitue une contrefaçon sanctionnée par le Code pénal sénégalais et les textes internationaux applicables.
              </p>
              <p>
                <strong>Contenu des utilisateurs :</strong> les utilisateurs conservent la propriété des contenus (textes, images) qu&apos;ils publient sur la plateforme. En publiant du contenu sur Wakhma Store, l&apos;utilisateur accorde à Wakhma Store SARL une licence non exclusive, gratuite, mondiale, permettant d&apos;afficher, reproduire et distribuer ledit contenu dans le cadre du fonctionnement de la plateforme et de sa promotion. Cette licence reste valable tant que le contenu est publié sur la plateforme et cesse à sa suppression par l&apos;utilisateur.
              </p>
            </div>
          </section>

          {/* 7. Marques déposées */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              7. Marques déposées
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                La dénomination <strong>« Wakhma Store »</strong> ainsi que le logo associé sont des marques déposées appartenant à Wakhma Store SARL. Toute utilisation de ces marques sans autorisation préalable écrite est interdite.
              </p>
              <p>
                Les autres marques, noms de produits ou de sociétés mentionnés sur le Site sont la propriété de leurs détenteurs respectifs. Leur mention sur le Site n&apos;implique aucune affiliation, endorsement ou partenariat avec Wakhma Store SARL sauf mention explicite.
              </p>
            </div>
          </section>

          {/* 8. Conditions d'utilisation */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              8. Conditions d&apos;utilisation
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                L&apos;utilisation du Site est soumise aux{' '}
                <Link href="/cgu" className="text-orange hover:underline">
                  Conditions Générales d&apos;Utilisation (CGU)
                </Link>{' '}
                accessibles à tout moment sur la plateforme. Tout utilisateur du Site est réputé avoir pris connaissance desdites conditions et les accepter sans réserve.
              </p>
            </div>
          </section>

          {/* 9. Politique de confidentialité */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              9. Politique de confidentialité
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Les informations relatives au traitement des données personnelles sont détaillées dans la{' '}
                <Link href="/confidentialite" className="text-orange hover:underline">
                  Politique de Confidentialité
                </Link>{' '}
                du Site. Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel au Sénégal et à la loi n° 2011-03 du 15 février 2011 relative aux données personnelles, chaque utilisateur dispose d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition au traitement de ses données personnelles.
              </p>
            </div>
          </section>

          {/* 10. Cookies */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              10. Cookies
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Le Site utilise exclusivement des cookies essentiels strictement nécessaires à son fonctionnement. Plus précisément, un cookie de session (jeton JWT — JSON Web Token) est utilisé pour maintenir l&apos;authentification des utilisateurs connectés.
              </p>
              <p>
                Dans sa version actuelle, le Site <strong>n&apos;utilise aucun cookie de suivi</strong> (tracking), aucune balise web espion, et <strong>aucun service d&apos;analyse tiers</strong> (tel que Google Analytics ou équivalent). Aucun cookie publicitaire ou de profilage n&apos;est déposé.
              </p>
              <p>
                L&apos;utilisateur peut à tout moment configurer son navigateur pour refuser les cookies ou être averti de leur dépôt. Le refus des cookies essentiels peut toutefois affecter les fonctionnalités du Site, notamment la connexion au compte utilisateur.
              </p>
            </div>
          </section>

          {/* 11. Limitation de responsabilité */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              11. Limitation de responsabilité
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Les informations diffusées sur le Site sont présentées à titre informatif et n&apos;ont pas de valeur contractuelle. Wakhma Store SARL s&apos;efforce de fournir des informations exactes et à jour mais ne saurait être tenue responsable des omissions, inexactitudes ou carences dans les informations mises à disposition, qu&apos;elles soient de son fait ou du fait de tiers.
              </p>
              <p>
                Wakhma Store SARL ne saurait être tenue responsable des dommages directs ou indirects résultant de l&apos;accès au Site ou de l&apos;utilisation des informations qui y sont publiées, y compris l&apos;indisponibilité du Site, les interruptions de service, les virus informatiques ou les failles de sécurité imputables à des tiers.
              </p>
              <p>
                Le Site peut contenir des liens hypertextes vers des sites externes. Wakhma Store SARL n&apos;exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu, leurs pratiques en matière de protection des données ou leur disponibilité.
              </p>
              <p>
                En tant que plateforme de mise en relation, Wakhma Store SARL n&apos;est pas partie aux transactions conclues entre les utilisateurs et ne saurait être tenue responsable de l&apos;exécution, de la qualité ou de la légalité des produits et services échangés entre ceux-ci.
              </p>
            </div>
          </section>

          {/* 12. Droit applicable */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              12. Droit applicable et juridiction compétente
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Les présentes mentions légales sont régies par le droit sénégalais, y compris les Actes uniformes de l&apos;Organisation pour l&apos;Harmonisation en Afrique du Droit des Affaires (OHADA), et en particulier l&apos;Acte uniforme relatif au droit commercial général et l&apos;Acte uniforme relatif aux sociétés commerciales et au GIE.
              </p>
              <p>
                En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes, les parties s&apos;efforceront de trouver une solution amiable. À défaut d&apos;accord amiable dans un délai de trente (30) jours, le litige sera soumis à la compétence exclusive des juridictions sénégalaises, le tribunal compétent étant celui du ressort de Dakar.
              </p>
            </div>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">
              13. Contact
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1">
              <p>
                Pour toute question relative aux présentes mentions légales, au traitement de vos données personnelles ou au fonctionnement du Site, vous pouvez contacter Wakhma Store SARL :
              </p>
              <ul className="list-none space-y-0.5 pl-2 mt-1">
                <li>Email : <Link href="mailto:contact@wakhmastore.com" className="text-orange hover:underline">contact@wakhmastore.com</Link></li>
                <li>Adresse : Dakar, Sénégal</li>
                <li>WhatsApp : Disponible via le bouton de contact du Site</li>
              </ul>
            </div>
          </section>

          {/* Last updated */}
          <p className="text-[10px] text-gray-400 pt-3 border-t border-gray-100">
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
