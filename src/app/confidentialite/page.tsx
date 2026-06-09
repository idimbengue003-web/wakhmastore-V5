import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de Wakhma Store. Données collectées, droits des utilisateurs, sécurité, cookies. Conforme à la loi sénégalaise n° 2008-24.',
  alternates: { canonical: '/confidentialite' },
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1 heading-compact">Politique de confidentialité</h1>
        <p className="text-xs text-gray-400 mb-5">Dernière mise à jour : Juin 2026</p>

        <div className="space-y-5">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">1. Introduction</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store respecte la vie privée de ses utilisateurs. La présente politique de confidentialité explique quelles données personnelles sont collectées, comment elles sont traitées, à quelles fins, et quels sont vos droits. Elle s&apos;applique à toute personne utilisant la plateforme Wakhma Store (site web et services associés), conformément à la LOI n° 2008-24 du 25 juillet 2008 relative à la protection des données personnelles en République du Sénégal, ainsi qu&apos;aux meilleures pratiques internationales en matière de protection des données.
            </p>
          </section>

          {/* 2. Responsable du traitement */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">2. Responsable du traitement</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Le responsable du traitement des données personnelles est :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Raison sociale :</span> Wakhma Store, SARL</li>
              <li><span className="font-medium">Siège social :</span> Dakar, Sénégal</li>
              <li><span className="font-medium">Email :</span> contact@wakhmastore.com</li>
            </ul>
          </section>

          {/* 3. Données collectées */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">3. Données collectées</h2>

            <h3 className="text-xs font-semibold text-gray-800 mb-1">a) Données fournies par l&apos;utilisateur</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lors de l&apos;inscription et de l&apos;utilisation du service, vous pouvez être amené à fournir les données suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li>Nom complet</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone <span className="italic">(obligatoire pour l&apos;inscription)</span></li>
              <li>Localisation (ville, quartier à Dakar)</li>
              <li>Mot de passe <span className="italic">(stocké sous forme hachée, jamais en clair)</span></li>
              <li>Informations de paiement liées aux achats de points et abonnements</li>
            </ul>

            <h3 className="text-xs font-semibold text-gray-800 mt-3 mb-1">b) Données collectées automatiquement</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lors de votre navigation sur la plateforme, les données suivantes peuvent être collectées automatiquement :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li>Adresse IP</li>
              <li>Type et version du navigateur</li>
              <li>Pages visitées et actions effectuées sur la plateforme</li>
              <li>Cookies de session (jetons JWT d&apos;authentification)</li>
            </ul>

            <h3 className="text-xs font-semibold text-gray-800 mt-3 mb-1">c) Données des réseaux sociaux</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Si vous choisissez de vous inscrire ou de vous connecter via les services d&apos;authentification Google ou Facebook (OAuth), nous recevons les données suivantes depuis ces plateformes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li>Nom complet</li>
              <li>Adresse email associée au compte tiers</li>
              <li>Photo de profil (si disponible et partagée par le fournisseur)</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              Ces données sont transmises conformément aux politiques de confidentialité de Google et Facebook. Vous pouvez à tout moment révoquer les autorisations d&apos;accès depuis les paramètres de votre compte Google ou Facebook.
            </p>
          </section>

          {/* 4. Finalités du traitement */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">4. Finalités du traitement</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Vos données personnelles sont traitées pour les finalités suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Gestion du compte :</span> création, authentification, mise à jour et suppression de votre compte utilisateur</li>
              <li><span className="font-medium">Fourniture du service :</span> publication et gestion des annonces, débloquage des coordonnées, mise en relation entre acheteurs et vendeurs</li>
              <li><span className="font-medium">Traitement des paiements :</span> gestion des achats de points, abonnements et transactions financières sur la plateforme</li>
              <li><span className="font-medium">Programme de parrainage :</span> attribution des points de parrainage, suivi des filleuls et gestion des récompenses</li>
              <li><span className="font-medium">Prévention de la fraude :</span> détection et prévention des activités frauduleuses, abus et violations des CGU</li>
              <li><span className="font-medium">Communication :</span> notifications liées au service, confirmations de transaction, alertes de sécurité et informations importantes</li>
              <li><span className="font-medium">Amélioration du service :</span> analyse de l&apos;utilisation de la plateforme dans le but d&apos;améliorer l&apos;expérience utilisateur et les fonctionnalités</li>
            </ul>
          </section>

          {/* 5. Base légale */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">5. Base légale du traitement</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conformément à la LOI n° 2008-24 du 25 juillet 2008 relative à la protection des données personnelles au Sénégal, le traitement de vos données repose sur les bases légales suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Consentement :</span> lorsque vous acceptez la collecte et le traitement de vos données lors de l&apos;inscription ou via les paramètres de votre compte (art. 6, équivalent au RGPD)</li>
              <li><span className="font-medium">Exécution du contrat :</span> le traitement est nécessaire à l&apos;exécution du contrat de service entre vous et Wakhma Store, notamment pour la gestion de votre compte et la fourniture des services souscrits</li>
              <li><span className="font-medium">Intérêt légitime :</span> le traitement est nécessaire aux fins des intérêts légitimes poursuivis par Wakhma Store, notamment la prévention de la fraude, la sécurité de la plateforme et l&apos;amélioration du service</li>
            </ul>
          </section>

          {/* 6. Durée de conservation */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">6. Durée de conservation des données</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Vos données personnelles sont conservées pour les durées suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Compte actif :</span> durée de vie du compte, jusqu&apos;à sa suppression par l&apos;utilisateur ou par Wakhma Store</li>
              <li><span className="font-medium">Compte supprimé :</span> les données sont anonymisées ou supprimées dans un délai de 30 jours suivant la suppression du compte, sous réserve des obligations légales</li>
              <li><span className="font-medium">Factures et données de paiement :</span> 10 ans à compter de la clôture de l&apos;exercice comptable, conformément aux dispositions du Traité OHADA (Acte uniforme portant organisation et harmonisation de la comptabilité)</li>
              <li><span className="font-medium">Logs de connexion et d&apos;activité :</span> 12 mois à compter de leur enregistrement</li>
              <li><span className="font-medium">Cookies de session :</span> durée de la session de navigation ; les jetons JWT ont une durée de validité de 7 jours</li>
            </ul>
          </section>

          {/* 7. Partage des données */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">7. Partage des données</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées avec les destinataires suivants, dans la mesure nécessaire aux finalités décrites ci-dessus :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Vercel Inc. :</span> hébergement de la plateforme, traitement des requêtes HTTP et déploiement des services</li>
              <li><span className="font-medium">Neon Technologies Inc. :</span> hébergement et gestion de la base de données PostgreSQL</li>
              <li><span className="font-medium">Google LLC / Facebook (Meta Platforms Inc.) :</span> fournisseurs d&apos;authentification OAuth, uniquement dans le cadre de la connexion via ces services</li>
              <li><span className="font-medium">Autorités légales :</span> les données peuvent être transmises aux autorités compétentes si la loi sénégalaise l&apos;exige, notamment sur réquisition judiciaire ou administrative</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              Aucun autre tiers n&apos;a accès à vos données personnelles. Les sous-traitants sont soumis à des obligations contractuelles de confidentialité et de protection des données.
            </p>
          </section>

          {/* 8. Transferts internationaux */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">8. Transferts internationaux de données</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Vos données peuvent être traitées sur les serveurs de Vercel et Neon, dont les infrastructures sont situées aux États-Unis et dans l&apos;Union européenne. Conformément à la LOI n° 2008-24, ces transferts sont encadrés par des garanties appropriées, notamment les clauses contractuelles types et les mesures de sécurité techniques mises en place par nos sous-traitants. Vous pouvez obtenir plus d&apos;informations sur ces garanties en nous contactant à l&apos;adresse indiquée à la section 15.
            </p>
          </section>

          {/* 9. Sécurité */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">9. Sécurité des données</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction, notamment :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li>Chiffrement des communications via HTTPS/TLS (Transport Layer Security)</li>
              <li>Hachage des mots de passe avec l&apos;algorithme bcrypt, sans stockage en clair</li>
              <li>Jeton d&apos;authentification JWT avec une durée d&apos;expiration de 7 jours</li>
              <li>Limitation du taux de requêtes (rate limiting) pour prévenir les attaques par force brute</li>
              <li>Protection CORS (Cross-Origin Resource Sharing) pour prévenir les accès non autorisés</li>
              <li>En-têtes de sécurité HTTP (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.)</li>
              <li>Audits de sécurité réguliers de l&apos;infrastructure et du code</li>
            </ul>
          </section>

          {/* 10. Cookies */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">10. Cookies</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store utilise uniquement des cookies essentiels au fonctionnement de la plateforme. Plus précisément :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Cookies de session (JWT) :</span> nécessaires à l&apos;authentification et au maintien de votre session connectée. Sans ces cookies, vous ne pourriez pas rester connecté sur la plateforme</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              Wakhma Store n&apos;utilise aucun cookie d&apos;analyse ou de statistiques (analytics), aucun cookie de pistage (tracking), et aucun cookie publicitaire. Vous pouvez à tout moment refuser les cookies via les paramètres de votre navigateur, mais cela empêchera le fonctionnement normal de la plateforme.
            </p>
          </section>

          {/* 11. Droits des utilisateurs */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">11. Droits des utilisateurs</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conformément à la LOI n° 2008-24 du 25 juillet 2008, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Droit d&apos;accès :</span> obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
              <li><span className="font-medium">Droit de rectification :</span> demander la correction de données inexactes ou incomplètes</li>
              <li><span className="font-medium">Droit à l&apos;effacement :</span> demander la suppression de vos données dans les conditions prévues par la loi</li>
              <li><span className="font-medium">Droit à la portabilité :</span> recevoir vos données dans un format structuré et couramment utilisé</li>
              <li><span className="font-medium">Droit à la limitation du traitement :</span> demander la suspension du traitement de vos données dans certains cas prévus par la loi</li>
              <li><span className="font-medium">Droit d&apos;opposition :</span> vous opposer au traitement de vos données pour des motifs légitimes</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              <span className="font-medium">Exercice de vos droits :</span> pour exercer l&apos;un quelconque de ces droits, vous pouvez nous contacter à l&apos;adresse <span className="font-medium">contact@wakhmastore.com</span> en précisant l&apos;objet de votre demande et en fournissant les éléments nécessaires à votre identification. Nous vous répondrons dans un délai maximal de 30 jours.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              <span className="font-medium">Réclamation :</span> si vous estimez que le traitement de vos données porte atteinte à vos droits, vous avez le droit d&apos;introduire une réclamation auprès de la Commission de Protection des Données Personnelles du Sénégal (CDP), autorité nationale de contrôle des données personnelles.
            </p>
          </section>

          {/* 12. Profilage et automatisation */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">12. Profilage et décision automatisée</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store ne procède à aucune prise de décision automatisée ni à aucun profilage basé sur vos données personnelles. Aucune décision vous affectant n&apos;est prise par un système automatisé sans intervention humaine.
            </p>
          </section>

          {/* 13. Mineurs */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">13. Mineurs</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Le service Wakhma Store est réservé aux personnes âgées de 18 ans ou plus. Conformément à la LOI n° 2008-24, les données des mineurs de moins de 18 ans ne peuvent être collectées qu&apos;avec le consentement de leur représentant légal. Wakhma Store ne collecte pas sciemment de données auprès de personnes mineures. Si vous avez connaissance qu&apos;un mineur a fourni des données personnelles sans consentement parental, veuillez nous contacter à contact@wakhmastore.com afin que nous puissions prendre les mesures nécessaires.
            </p>
          </section>

          {/* 14. Modifications */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">14. Modifications de la politique</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store se réserve le droit de modifier la présente politique de confidentialité à tout moment. En cas de modification substantielle, les utilisateurs seront informés par email ou via un bandeau de notification sur la plateforme avant l&apos;entrée en vigueur des changements. La poursuite de l&apos;utilisation du service après notification constitue une acceptation des modifications apportées. La date de dernière mise à jour est indiquée en tête de la présente politique.
            </p>
          </section>

          {/* 15. Contact */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 heading-compact">15. Contact</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pour toute question, demande d&apos;exercice de vos droits ou réclamation relative à la présente politique de confidentialité, vous pouvez nous contacter :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Email :</span> contact@wakhmastore.com</li>
              <li><span className="font-medium">Adresse :</span> Dakar, Sénégal</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              Pour déposer une réclamation auprès de l&apos;autorité de contrôle compétente :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed mt-1 ml-4 list-disc space-y-0.5">
              <li><span className="font-medium">Commission de Protection des Données Personnelles du Sénégal (CDP)</span></li>
            </ul>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
