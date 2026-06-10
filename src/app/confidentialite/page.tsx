import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de confidentialité</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Collecte des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store collecte les données nécessaires au fonctionnement du service : nom, email, numéro de téléphone, localisation. Ces données sont fournies volontairement lors de l&apos;inscription et de l&apos;utilisation du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Utilisation des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont utilisées pour : la gestion de votre compte, la publication d&apos;annonces, la mise en relation avec d&apos;autres utilisateurs, l&apos;amélioration de nos services et la communication liée à votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Partage des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données personnelles ne sont jamais vendues à des tiers. Certaines informations (nom, téléphone) peuvent être visibles par d&apos;autres utilisateurs dans le cadre des annonces publiées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Sécurité</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store utilise des cookies essentiels au fonctionnement du site. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément à la loi, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@wakhmastore.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Conservation des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont anonymisées ou supprimées dans un délai de 30 jours, sauf obligation légale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              Cette politique peut être modifiée à tout moment. Les utilisateurs seront notifiés des changements importants par email ou via la plateforme.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
