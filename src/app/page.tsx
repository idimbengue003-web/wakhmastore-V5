'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Zap, Shield, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnonceCard from '@/components/AnnonceCard';

const categories = [
  { name: 'Téléphones', emoji: '📱' },
  { name: 'TV & Écrans', emoji: '📺' },
  { name: 'Frigo & Congélateur', emoji: '🧊' },
  { name: 'Climatiseur & Ventilateur', emoji: '❄️' },
  { name: 'Ordinateurs', emoji: '💻' },
  { name: 'Tablettes', emoji: '📲' },
  { name: 'Audio & Son', emoji: '🔊' },
  { name: 'Électroménager', emoji: '🏠' },
  { name: 'Plomberie', emoji: '🔧' },
  { name: 'Électricité', emoji: '⚡' },
  { name: 'Meubles', emoji: '🛋️' },
  { name: 'Mode & Vetements', emoji: '👗' },
  { name: 'Cosmétiques', emoji: '💄' },
  { name: 'Alimentation', emoji: '🍜' },
  { name: 'Services', emoji: '🤝' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Immobilier', emoji: '🏗️' },
  { name: 'Autre', emoji: '📦' },
];

const quickCategories = [
  'Téléphones',
  'TV & Écrans',
  'Ordinateurs',
  'Meubles',
  'Transport',
  'Immobilier',
];

interface Annonce {
  id: string;
  title: string;
  price: number;
  category: string;
  emoji: string;
  location: string;
  isVip: boolean;
  vipType: string | null;
  createdAt: string;
}

export default function HomePage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAnnonces() {
      try {
        const res = await fetch('/api/annonces');
        if (res.ok) {
          const data = await res.json();
          setAnnonces(data);
        }
      } catch (error) {
        console.error('Error fetching annonces:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonces();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section — Bleu clair */}
      <section className="relative bg-gradient-to-br from-orange-dark via-orange to-blue-vivid overflow-hidden">
        {/* Soft background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-28 h-28 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-36 h-36 border border-white rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight heading-compact">
            Wakhma Store
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 font-medium">
            Les bonnes affaires à Dakar 🇸🇳
          </p>
          <p className="text-white/70 mb-6 max-w-xl mx-auto text-sm">
            Poste ce que tu veux. Les vendeurs te le trouvent rapidement.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="search-bar-shadow flex rounded-lg bg-white p-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Que cherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-0 focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 h-10 text-sm"
                />
              </div>
              <Link
                href={searchQuery ? `/annonces?search=${encodeURIComponent(searchQuery)}` : '/annonces'}
              >
                <Button size="sm" className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-md px-5 h-10 transition-all duration-200 text-xs">
                  Rechercher
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {quickCategories.map((cat) => (
              <Link key={cat} href={`/annonces?category=${encodeURIComponent(cat)}`}>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm hover:bg-white/25 transition-all duration-200 cursor-pointer hover:scale-105">
                  {categories.find((c) => c.name === cat)?.emoji} {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 heading-compact">
              Annonces récentes
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Les dernières demandes postées sur Wakhma Store</p>
          </div>
          <Link href="/annonces">
            <Button variant="ghost" size="sm" className="text-orange hover:text-orange-dark hover:bg-orange-bg font-semibold transition-all duration-200 text-xs">
              Voir tout <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-100 overflow-hidden">
                <div className="bg-orange-bg h-24" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">Aucune annonce pour le moment</p>
            <Link href="/deposer">
              <Button size="sm" className="mt-3 bg-orange hover:bg-orange-dark text-white font-semibold rounded-md text-xs transition-all duration-200">
                Déposer la première annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 stagger-children">
            {annonces.slice(0, 8).map((annonce) => (
              <AnnonceCard key={annonce.id} {...annonce} />
            ))}
          </div>
        )}
      </section>

      {/* Catégories */}
      <section className="bg-orange-bg/50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 heading-compact">
              Explorez les catégories
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Trouvez ce que vous cherchez en un clic</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/annonces?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-lg bg-white border border-gray-100 hover:border-orange/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-orange transition-colors duration-200 text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Rapide/Fiable/Efficace */}
      <section className="bg-gradient-to-br from-orange-dark via-orange to-blue-vivid py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white heading-compact">
              Pourquoi Wakhma Store ?
            </h2>
            <p className="text-white/80 text-xs mt-0.5">Rapide, fiable et efficace</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1 heading-compact">Rapide</h3>
              <p className="text-gray-500 text-xs">
                Postez votre demande en quelques secondes et recevez des réponses rapidement.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1 heading-compact">Fiable</h3>
              <p className="text-gray-500 text-xs">
                Des vendeurs vérifiés et un système de confiance pour vos transactions.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1 heading-compact">Efficace</h3>
              <p className="text-gray-500 text-xs">
                Trouvez exactement ce que vous cherchez au meilleur prix à Dakar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-orange-bg rounded-lg p-6 sm:p-8 text-center border border-orange/10 transition-all duration-300 hover:shadow-lg">
          <Sparkles className="w-8 h-8 text-orange mx-auto mb-3" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 heading-compact">
            Tu cherches un objet introuvable ou budget limité ?
          </h2>
          <p className="text-gray-600 mb-4 max-w-lg mx-auto text-xs">
            Dépose une annonce gratuitement et laisse les vendeurs de Dakar te trouver la meilleure offre !
          </p>
          <Link href="/deposer">
            <Button size="sm" className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-md px-6 py-2 text-xs h-auto transition-all duration-200 hover:scale-105">
              Déposer une annonce
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
