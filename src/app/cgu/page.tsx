import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Conditions générales d&apos;utilisation</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Objet</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes CGU régissent l&apos;utilisation de la plateforme Wakhma Store, un service de petites annonces en ligne destiné aux résidents de Dakar et du Sénégal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Inscription</h2>
            <p className="text-gray-600 leading-relaxed">
              L&apos;utilisation de Wakhma Store nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour. Toute fausse déclaration peut entraîner la suspension du compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Publication d&apos;annonces</h2>
            <p className="text-gray-600 leading-relaxed">
              Les utilisateurs peuvent publier des annonces conformément à leur plan d&apos;abonnement. Les annonces doivent être légales, véridiques et ne doivent pas porter atteinte aux droits de tiers. Wakhma Store se réserve le droit de supprimer toute annonce non conforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Plans et tarifs</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store propose trois plans : BOLT ⚡ Diambar (3 annonces "Je vends"/mois, 15 000 points, 2 000 FCFA), Diambar (5 annonces "Je vends"/mois, 26 000 points, 5 000 FCFA) et VIP KING (5 annonces "Je vends"/semaine, 49 000 points, 9 900 FCFA). Les tarifs peuvent être modifiés avec un préavis de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Transactions</h2>
            <p className="text-gray-600 leading-relaxed">
              Wakhma Store est une plateforme de mise en relation. Les transactions se font directement entre utilisateurs. Wakhma Store ne garantit pas les transactions et recommande la prudence lors des échanges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Comportement interdit</h2>
            <p className="text-gray-600 leading-relaxed">
              Sont interdits : la publication de contenus illégaux, la fraude, le spam, le harcèlement, l&apos;usurpation d&apos;identité et toute activité portant atteinte au bon fonctionnement de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Résiliation</h2>
            <p className="text-gray-600 leading-relaxed">
              L&apos;utilisateur peut résilier son compte à tout moment. Wakhma Store se réserve le droit de suspendre ou supprimer un compte en cas de violation des CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes CGU sont soumises au droit sénégalais. Tout litige sera soumis aux tribunaux compétents de Dakar.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
