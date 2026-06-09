import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation de Wakhma Store. Règles d'utilisation, système de points, abonnements, paiements et droit applicable sénégalais.",
  alternates: { canonical: '/cgu' },
};

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-5 heading-compact">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Dernière mise à jour : 4 mars 2026
        </p>

        <div className="space-y-6">
          {/* 1. Objet */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">1. Objet</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après &laquo; CGU &raquo;) ont pour objet de définir les modalités et conditions d&apos;utilisation de la plateforme Wakhma Store, accessible à l&apos;adresse wakhmastore.com et via ses applications mobiles.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store est un marketplace inversé opérant depuis Dakar, Sénégal. Contrairement aux plateformes classiques où les vendeurs publient des offres, Wakhma Store inverse le modèle : les chercheurs (personnes à la recherche d&apos;un produit ou service) publient gratuitement des annonces décrivant leur besoin, et les vendeurs payent pour accéder aux coordonnées des chercheurs et leur proposer leurs offres.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Toute utilisation de la plateforme implique l&apos;acceptation pleine et entière des présentes CGU. L&apos;utilisateur qui refuse de s&apos;y conformer doit cesser toute utilisation du service.
            </p>
          </section>

          {/* 2. Définitions */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">2. Définitions</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Dans les présentes CGU, les termes suivants ont la signification ci-dessous :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-2 list-none pl-0">
              <li>
                <strong className="text-gray-800">Utilisateur :</strong> toute personne physique ou morale inscrite sur la plateforme Wakhma Store, qu&apos;elle agisse en tant que chercheur ou vendeur.
              </li>
              <li>
                <strong className="text-gray-800">Chercheur :</strong> utilisateur qui publie une annonce décrivant un besoin (produit ou service recherché) afin que des vendeurs puissent le contacter.
              </li>
              <li>
                <strong className="text-gray-800">Vendeur :</strong> utilisateur qui consulte les annonces publiées et paie en points pour débloquer les coordonnées d&apos;un chercheur afin de lui proposer une offre.
              </li>
              <li>
                <strong className="text-gray-800">Annonce :</strong> publication créée par un chercheur décrivant un produit ou service recherché, incluant une description, une catégorie, une localisation et des coordonnées de contact.
              </li>
              <li>
                <strong className="text-gray-800">Points :</strong> unité monétaire virtuelle utilisée sur la plateforme pour le débloquage des coordonnées des chercheurs. Les points s&apos;acquièrent par achat ou par parrainage.
              </li>
              <li>
                <strong className="text-gray-800">Abonnement :</strong> formule payante souscrite par un vendeur lui conférant des avantages en termes de nombre d&apos;annonces publiables et de coût en points par débloquage.
              </li>
              <li>
                <strong className="text-gray-800">Débloquage :</strong> action par laquelle un vendeur dépense des points pour accéder aux coordonnées téléphoniques ou WhatsApp d&apos;un chercheur ayant publié une annonce.
              </li>
              <li>
                <strong className="text-gray-800">Marketplace inversé :</strong> modèle économique dans lequel la demande (besoins des chercheurs) est mise en avant et les vendeurs paient pour accéder à cette demande, contrairement au modèle traditionnel où les vendeurs exposent leurs offres.
              </li>
              <li>
                <strong className="text-gray-800">Plateforme :</strong> l&apos;ensemble des services proposés par Wakhma Store via son site web et ses applications, incluant la publication d&apos;annonces, le système de points, les abonnements et le parrainage.
              </li>
            </ul>
          </section>

          {/* 3. Inscription et compte */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">3. Inscription et compte</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;inscription sur Wakhma Store est ouverte à toute personne physique âgée d&apos;au moins 18 ans ou toute personne morale disposant de la capacité juridique nécessaire. L&apos;inscription nécessite la fourniture des informations suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-disc pl-4 mb-3">
              <li>Nom complet (prénom et nom)</li>
              <li>Adresse email valide</li>
              <li>Numéro de téléphone portable obligatoire, au format sénégalais (+221) ou international</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;inscription peut également s&apos;effectuer via les mécanismes d&apos;authentification tiers OAuth, notamment Google et Facebook. Dans ce cas, les informations de compte du tiers sont importées automatiquement. L&apos;utilisateur reste responsable de l&apos;exactitude des données ainsi importées.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store se réserve le droit de procéder à une vérification de l&apos;identité et des coordonnées fournies, notamment par l&apos;envoi d&apos;un code de validation par SMS au numéro de téléphone indiqué. Tout compte dont les informations se révèlent inexactes peut être suspendu sans préavis.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;utilisateur s&apos;engage à maintenir ses informations à jour et à les modifier en cas de changement. Il est seul responsable de la confidentialité de ses identifiants de connexion. Toute activité réalisée depuis son compte est réputée effectuée par lui.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              La création de comptes multiples par un même utilisateur est interdite sauf autorisation expresse de Wakhma Store.
            </p>
          </section>

          {/* 4. Publication d'annonces */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">4. Publication d&apos;annonces</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              La publication d&apos;annonces est gratuite pour les chercheurs. Chaque annonce doit décrire avec précision et honnêteté le produit ou service recherché, incluant si possible la catégorie, la localisation et le budget estimé.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Le nombre d&apos;annonces qu&apos;un utilisateur peut publier par mois est limité selon son plan d&apos;abonnement : 3 annonces pour le plan Gratuit, 15 annonces pour le plan Diambar, et sans limite pour le plan VIP KING.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;utilisateur s&apos;engage à ce que le contenu de ses annonces soit conforme à la loi sénégalaise en vigueur et aux présentes CGU. Sont notamment interdits dans les annonces :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-disc pl-4 mb-3">
              <li>Les produits ou services illégaux, contrefaits ou réglementés sans autorisation</li>
              <li>Les contenus discriminatoires, haineux, violents ou portant atteinte à la dignité humaine</li>
              <li>Les informations trompeuses, mensongères ou destinées à induire en erreur</li>
              <li>Les coordonnées de tiers publiées sans leur consentement</li>
              <li>Les contenus à caractère pornographique ou obscène</li>
              <li>La promotion de pratiques commerciales déloyales ou de systèmes pyramidaux</li>
              <li>Toute forme de publicité ou de lien externe non autorisé</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store se réserve le droit de modérer, modifier ou supprimer sans préavis toute annonce ne respectant pas les présentes règles, sans que cette modération ne puisse engager sa responsabilité. Wakhma Store n&apos;a toutefois aucune obligation générale de surveillance des annonces publiées.
            </p>
          </section>

          {/* 5. Système de points */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">5. Système de points</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les points constituent la monnaie virtuelle de la plateforme Wakhma Store. Ils sont utilisés exclusivement pour le débloquage des coordonnées des chercheurs. Les points n&apos;ont aucune valeur monétaire en dehors de la plateforme et ne constituent pas un instrument financier.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les points peuvent être acquis de deux manières : par achat via les formules de recharge, ou par le biais du programme de parrainage. Les formules de recharge disponibles sont les suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-none pl-0 mb-3">
              <li><strong className="text-gray-800">Starter :</strong> 1 300 FCFA pour 7 000 points</li>
              <li><strong className="text-gray-800">Standard :</strong> 2 500 FCFA pour 17 000 points</li>
              <li><strong className="text-gray-800">Premium :</strong> 5 000 FCFA pour 50 000 points</li>
              <li><strong className="text-gray-800">Ultimate :</strong> 10 000 FCFA pour 105 000 points</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les points achetés sont crédités sur le compte de l&apos;utilisateur dès confirmation du paiement. En environnement de démonstration, les transactions sont simulées et aucun paiement réel n&apos;est effectué. En environnement de production, les paiements sont réels et irréversibles.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les points sont strictement personnels et non transférables entre comptes. Ils ne peuvent faire l&apos;objet d&apos;aucun remboursement, échange ou conversion en espèces, sauf dans les cas prévus par la loi.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Les points expirent après 12 mois consécutifs d&apos;inactivité du compte, l&apos;inactivité étant définie comme l&apos;absence de toute connexion au compte ou de toute transaction (achat de points, débloquage, publication d&apos;annonce). En cas d&apos;expiration, les points perdus ne pourront être restaurés.
            </p>
          </section>

          {/* 6. Abonnements */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">6. Abonnements</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store propose trois formules d&apos;abonnement permettant aux vendeurs de bénéficier d&apos;avantages en termes de volume d&apos;annonces et de coût de débloquage :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-2 list-none pl-0 mb-3">
              <li>
                <strong className="text-gray-800">Gratuit :</strong> sans frais récurrents — 3 annonces par mois — 1 500 points par débloquage de coordonnées.
              </li>
              <li>
                <strong className="text-gray-800">Diambar :</strong> 2 000 FCFA par mois — 15 annonces par mois — 1 000 points par débloquage de coordonnées.
              </li>
              <li>
                <strong className="text-gray-800">VIP KING :</strong> 5 000 FCFA par mois — annonces illimitées — 800 points par débloquage de coordonnées.
              </li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les abonnements Diambar et VIP KING sont soumis à un renouvellement automatique à la fin de chaque période mensuelle. Le renouvellement est effectué selon le mode de paiement enregistré, sans action requise de l&apos;utilisateur.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. La résiliation prend effet à la fin de la période en cours. L&apos;utilisateur conserve les avantages de son abonnement jusqu&apos;à la date d&apos;expiration de la période payée.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              En cas de résiliation, aucun remboursement au prorata des jours restants ne sera effectué. Les montants déjà facturés restent acquis à Wakhma Store.
            </p>
          </section>

          {/* 7. Débloquage des coordonnées */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">7. Débloquage des coordonnées</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Le débloquage est la fonctionnalité centrale du modèle de marketplace inversé de Wakhma Store. Lorsqu&apos;un vendeur identifie une annonce correspondant à son offre, il peut dépenser des points pour accéder aux coordonnées du chercheur (numéro de téléphone et/ou lien WhatsApp).
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Le nombre de points requis pour un débloquage dépend du plan d&apos;abonnement du vendeur : 1 500 points pour le plan Gratuit, 1 000 points pour le plan Diambar, et 800 points pour le plan VIP KING.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Dès lors que le débloquage est effectué et que les coordonnées ont été affichées à l&apos;utilisateur, les points dépensés ne sont pas remboursables, que le vendeur parvienne ou non à conclure une transaction avec le chercheur. L&apos;accès aux coordonnées est irréversible.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Les coordonnées débloquées sont confidentielles. Le vendeur s&apos;interdit de les communiquer à des tiers, de les utiliser à des fins autres que la proposition commerciale liée à l&apos;annonce, ou de les stocker au-delà de la durée nécessaire au premier contact. Toute utilisation abusive des coordonnées débloquées pourra entraîner la suspension du compte.
            </p>
          </section>

          {/* 8. Programme de parrainage */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">8. Programme de parrainage</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store operate un programme de parrainage permettant à tout utilisateur de gagner des points en invitant de nouveaux utilisateurs à s&apos;inscrire sur la plateforme.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Chaque utilisateur dispose d&apos;un code de parrainage unique, accessible depuis son espace personnel. Lorsqu&apos;un nouvel utilisateur s&apos;inscrit en utilisant ce code de parrainage, le parrain reçoit 400 points, crédités après validation du compte du filleul.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Le nombre total de points pouvant être obtenus via le parrainage est plafonné à 30 000 points par compte. Ce plafond est calculé sur la base de 75 filleuls valides maximum.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Toute tentative de fraude ou d&apos;abus du système de parrainage, notamment la création de comptes fictifs pour obtenir des points de parrainage, l&apos;utilisation de codes de parrainage sur ses propres comptes, ou toute manipulation visant à contourner le plafond, entraînera l&apos;annulation des points obtenus de manière frauduleuse et la suspension potentielle du compte.
            </p>
          </section>

          {/* 9. Paiement */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">9. Paiement</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les paiements sur Wakhma Store peuvent être effectués via les méthodes suivantes :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-disc pl-4 mb-3">
              <li><strong className="text-gray-800">Wave :</strong> paiement mobile via l&apos;application Wave</li>
              <li><strong className="text-gray-800">Orange Money :</strong> paiement mobile via le service Orange Money</li>
              <li><strong className="text-gray-800">Virement bancaire :</strong> transfert direct sur le compte bancaire de Wakhma Store</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              En environnement de démonstration, les transactions financières sont simulées et aucun prélèvement réel n&apos;est effectué sur le compte de l&apos;utilisateur. Les soldes de points et les abonnements sont virtuels et destinés uniquement à des fins de test.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              En environnement de production, tous les paiements sont réels et définitifs. La confirmation du paiement peut prendre un délai de traitement allant jusqu&apos;à 24 heures selon le moyen de paiement utilisé et les vérifications nécessaires.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              L&apos;utilisateur reconnaît que toute transaction effectuée depuis son compte est réputée autorisée par lui. En cas de litige relatif à un paiement, l&apos;utilisateur doit contacter Wakhma Store à l&apos;adresse contact@wakhmastore.com dans un délai de 7 jours suivant l&apos;opération contestée.
            </p>
          </section>

          {/* 10. Propriété intellectuelle */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">10. Propriété intellectuelle</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;ensemble des éléments composant la plateforme Wakhma Store, y compris mais sans s&apos;y limiter : le nom commercial, le logo, le design, la charte graphique, les textes, les images, les logiciels, les bases de données, les algorithmes et l&apos;architecture technique, sont la propriété exclusive de Wakhma Store et sont protégés par les lois sénégalaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              En publiant du contenu sur la plateforme (annonces, images, descriptions), l&apos;utilisateur accorde à Wakhma Store une licence non exclusive, mondiale, gratuite, incluant le droit de reproduire, représenter, adapter et distribuer ledit contenu dans le cadre du fonctionnement du service et de sa promotion.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Est strictement interdit tout extraction, collecte automatisée (scraping), copie, reproduction ou utilisation des données de la plateforme par quelque moyen que ce soit, y compris par l&apos;utilisation de robots, scripts ou logiciels automatiques, sans autorisation écrite préalable de Wakhma Store. Toute violation de cette interdiction pourra faire l&apos;objet de poursuites judiciaires.
            </p>
          </section>

          {/* 11. Responsabilité */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">11. Responsabilité</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store est une plateforme de mise en relation entre chercheurs et vendeurs. Wakhma Store n&apos;est en aucun cas partie aux transactions conclues entre les utilisateurs et ne peut être tenu pour responsable de l&apos;exécution, de la qualité, de la conformité ou de la légalité des produits et services échangés.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store ne garantit pas que les informations contenues dans les annonces sont exactes, complètes ou à jour. Il appartient à chaque utilisateur de vérifier par lui-même les informations et les contenus auxquels il accède.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              La responsabilité de Wakhma Store ne pourra en aucun cas être engagée pour les dommages directs ou indirects résultant de l&apos;utilisation de la plateforme, de l&apos;impossibilité d&apos;y accéder, ou des relations entre utilisateurs, y compris les pertes financières, les préjudices commerciaux ou les dommages résultant de transactions frauduleuses.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wakhma Store ne saurait être tenu responsable des interruptions de service, qu&apos;elles soient dues à des opérations de maintenance, des force majeure, des pannes techniques ou des attaques informatiques. Wakhma Store s&apos;engage à tout mettre en œuvre pour rétablir l&apos;accès dans les meilleurs délais.
            </p>
          </section>

          {/* 12. Comportement interdit */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">12. Comportement interdit</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Sont strictement interdits sur la plateforme Wakhma Store les comportements suivants :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-disc pl-4 mb-3">
              <li>La fraude sous toutes ses formes, notamment la création de fausses annonces, l&apos;usurpation d&apos;identité ou la simulation de transactions</li>
              <li>L&apos;envoi de messages non sollicités (spam), de contenus publicitaires non autorisés ou de chaînes de messages</li>
              <li>Le harcèlement, les menaces, l&apos;intimidation ou tout comportement portant atteinte à la personne d&apos;un autre utilisateur</li>
              <li>La publication d&apos;annonces fictives, trompeuses ou destinées à escroquer d&apos;autres utilisateurs</li>
              <li>La proposition ou la vente de produits ou services illégaux, contrefaits, volés ou réglementés sans autorisation</li>
              <li>L&apos;usurpation d&apos;identité, y compris l&apos;utilisation du nom, de l&apos;image ou des coordonnées d&apos;un tiers sans son consentement</li>
              <li>La manipulation du système de points, du programme de parrainage ou de tout autre mécanisme de la plateforme en vue d&apos;obtenir un avantage indu</li>
              <li>La création de comptes multiples dans le but de contourner les limitations du plan Gratuit ou d&apos;obtenir frauduleusement des points de parrainage</li>
              <li>Toute tentative de piratage, d&apos;accès non autorisé ou d&apos;exploitation de failles de sécurité de la plateforme</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed">
              Le non-respect de ces interdictions pourra entraîner la suspension ou la résiliation immédiate du compte, la confiscation des points et, le cas échéant, des poursuites judiciaires.
            </p>
          </section>

          {/* 13. Suspension et résiliation */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">13. Suspension et résiliation</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store se réserve le droit de suspendre ou résilier tout compte en cas de non-respect des présentes CGU, de comportement frauduleux, ou d&apos;activité portant préjudice à la plateforme ou à ses utilisateurs. La suspension peut être temporaire ou définitive, selon la gravité du manquement.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              En cas de suspension ou résiliation pour manquement aux CGU, les points restants sur le compte ne sont pas remboursés et les abonnements en cours ne font l&apos;objet d&apos;aucun remboursement au prorata.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              L&apos;utilisateur peut supprimer son compte à tout moment depuis les paramètres de son espace personnel ou en adressant une demande à contact@wakhmastore.com. La suppression du compte entraîne la perte irréversible de l&apos;ensemble des données associées, y compris les points et l&apos;historique des transactions.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conformément aux obligations légales, Wakhma Store conserve certaines données pendant une durée de 30 jours suivant la suppression du compte, afin de permettre le traitement des éventuels litiges en cours et de se conformer aux obligations de conservation imposées par la loi. Au-delà de ce délai, les données sont anonymisées ou définitivement supprimées, à l&apos;exception de celles dont la conservation est requise par la réglementation applicable.
            </p>
          </section>

          {/* 14. Données personnelles */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">14. Données personnelles</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store s&apos;engage à traiter les données personnelles de ses utilisateurs conformément à la loi n° 2008-24 du 25 juillet 2008 sur la protection des données à caractère personnel en République du Sénégal et à sa Politique de Confidentialité accessible à l&apos;adresse wakhmastore.com/confidentialite.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              En créant un compte et en utilisant la plateforme, l&apos;utilisateur consent au traitement de ses données personnelles pour les finalités décrites dans la Politique de Confidentialité, notamment : la gestion du compte, la mise en relation entre utilisateurs, la gestion des paiements, l&apos;envoi de communications liées au service et l&apos;amélioration de la plateforme.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              L&apos;utilisateur dispose d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de ses données. Pour exercer ces droits, il peut adresser sa demande à contact@wakhmastore.com. Pour plus de détails, l&apos;utilisateur est invité à consulter la Politique de Confidentialité intégrale.
            </p>
          </section>

          {/* 15. Modification des CGU */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">15. Modification des CGU</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Wakhma Store se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, les utilisateurs seront informés par notification sur la plateforme ou par email, avec un préavis de 15 jours avant l&apos;entrée en vigueur des nouvelles conditions.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              L&apos;utilisation continue de la plateforme après l&apos;entrée en vigueur des modifications vaut acceptation sans réserve des nouvelles CGU. L&apos;utilisateur qui refuse les nouvelles conditions doit cesser d&apos;utiliser la plateforme et, le cas échéant, supprimer son compte conformément à l&apos;article 13.
            </p>
          </section>

          {/* 16. Droit applicable et juridiction */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">16. Droit applicable et juridiction</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Les présentes CGU sont régies par le droit sénégalais, et notamment par la LOI n° 2008-24 du 25 juillet 2008 sur la cybercriminalité et la protection des données à caractère personnel, ainsi que par l&apos;Acte uniforme de l&apos;Organisation pour l&apos;Harmonisation en Afrique du Droit des Affaires (OHADA) relatif au droit commercial général.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU, les parties s&apos;efforceront de trouver une solution amiable. À défaut d&apos;accord dans un délai de 30 jours, le litige sera soumis à la compétence exclusive des tribunaux de Dakar, Sénégal.
            </p>
          </section>

          {/* 17. Contact */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 heading-compact">17. Contact</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Pour toute question, réclamation ou demande relative aux présentes CGU, l&apos;utilisateur peut contacter Wakhma Store par les moyens suivants :
            </p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-1 list-none pl-0">
              <li><strong className="text-gray-800">Email :</strong> contact@wakhmastore.com</li>
              <li><strong className="text-gray-800">Adresse :</strong> Dakar, Sénégal</li>
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed mt-3">
              Wakhma Store s&apos;engage à répondre à toute demande dans un délai raisonnable et dans la mesure du possible dans les 48 heures ouvrées.
            </p>
          </section>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-4">
          <p className="text-[10px] text-gray-400 text-center">
            © {new Date().getFullYear()} Wakhma Store — Tous droits réservés
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
