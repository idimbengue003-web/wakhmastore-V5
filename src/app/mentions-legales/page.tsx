import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions légales</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Éditeur du site</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store est un service de mise en relation entre acheteurs et vendeurs basé à Dakar, Sénégal.
              Email : contact@wakhmastore.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Hébergement</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site Wakhma Store est hébergé sur des serveurs sécurisés. Les données sont stockées conformément aux réglementations en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Propriété intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              L&apos;ensemble des contenus présents sur le site Wakhma Store (textes, images, logos, design) est protégé par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Responsabilité</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store est une plateforme de mise en relation. Nous ne sommes pas partie aux transactions entre utilisateurs et ne pouvons être tenus responsables de la qualité des produits ou services échangés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Données personnelles</h2>
            <p className="text-gray-600 leading-relaxed">
              Les données personnelles collectées sont traitées conformément à notre politique de confidentialité. Vous disposez d&apos;un droit d&apos;accès, de modification et de suppression de vos données.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
