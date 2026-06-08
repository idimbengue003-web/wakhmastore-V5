import Link from 'next/link';
import { Store, MapPin, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Wakhma Store</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Le marketplace #1 de Dakar, Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/annonces" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  Annonces
                </Link>
              </li>
              <li>
                <Link href="/deposer" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  Déposer une annonce
                </Link>
              </li>
              <li>
                <Link href="/recharge" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  Recharger
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-sm text-gray-400 hover:text-orange transition-colors">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-orange" />
                Dakar, Sénégal
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle className="w-4 h-4 text-orange" />
                WhatsApp disponible
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-orange" />
                contact@wakhmastore.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Wakhma Store. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
