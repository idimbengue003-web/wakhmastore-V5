import Link from 'next/link';
import { Store, MapPin, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-6 h-6 bg-orange rounded-md flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white heading-compact">Wakhma Store</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Poste ce que tu veux. Les vendeurs te le trouvent rapidement. Le marketplace #1 de Dakar, Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 heading-compact">Navigation</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/annonces" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Annonces
                </Link>
              </li>
              <li>
                <Link href="/deposer" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Déposer une annonce
                </Link>
              </li>
              <li>
                <Link href="/recharge" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Recharger
                </Link>
              </li>
              <li>
                <Link href="/parrainage" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Parrainage
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 heading-compact">Légal</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/mentions-legales" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-xs text-gray-400 hover:text-orange transition-colors">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 heading-compact">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="w-3 h-3 text-orange" />
                Dakar, Sénégal
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-400">
                <MessageCircle className="w-3 h-3 text-orange" />
                WhatsApp disponible
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-400">
                <Mail className="w-3 h-3 text-orange" />
                contact@wakhmastore.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Wakhma Store. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
