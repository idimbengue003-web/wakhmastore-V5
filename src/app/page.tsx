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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-dark to-orange overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Wakhma Store
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 font-medium">
            Les bonnes affaires à Dakar 🇸🇳
          </p>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Poste ce que tu veux. Les vendeurs te le trouvent rapidement.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="search-bar-shadow flex rounded-xl bg-white p-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Que cherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 h-12 text-base"
                />
              </div>
              <Link
                href={searchQuery ? `/annonces?search=${encodeURIComponent(searchQuery)}` : '/annonces'}
              >
                <Button className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg px-6 h-12">
                  Rechercher
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickCategories.map((cat) => (
              <Link key={cat} href={`/annonces?category=${encodeURIComponent(cat)}`}>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-colors cursor-pointer">
                  {categories.find((c) => c.name === cat)?.emoji} {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Annonces récentes
            </h2>
            <p className="text-gray-500 mt-1">Les dernières demandes postées sur Wakhma Store</p>
          </div>
          <Link href="/annonces">
            <Button variant="ghost" className="text-orange hover:text-orange-dark hover:bg-orange-bg font-semibold">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-orange-bg h-28" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune annonce pour le moment</p>
            <Link href="/deposer">
              <Button className="mt-4 bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                Déposer la première annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {annonces.slice(0, 8).map((annonce) => (
              <AnnonceCard key={annonce.id} {...annonce} />
            ))}
          </div>
        )}
      </section>

      {/* Catégories */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Explorez les catégories
            </h2>
            <p className="text-gray-500 mt-1">Trouvez ce que vous cherchez en un clic</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/annonces?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white border border-gray-100 hover:border-orange/30 hover:shadow-md transition-all"
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange transition-colors text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Rapide/Fiable/Efficace */}
      <section className="bg-gradient-to-br from-orange to-orange-dark py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Pourquoi Wakhma Store ?
            </h2>
            <p className="text-white/80 mt-1">Rapide, fiable et efficace</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Rapide</h3>
              <p className="text-gray-500 text-sm">
                Postez votre demande en quelques secondes et recevez des réponses rapidement.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Fiable</h3>
              <p className="text-gray-500 text-sm">
                Des vendeurs vérifiés et un système de confiance pour vos transactions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Efficace</h3>
              <p className="text-gray-500 text-sm">
                Trouvez exactement ce que vous cherchez au meilleur prix à Dakar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-orange-bg rounded-2xl p-8 sm:p-12 text-center border border-orange/10">
          <Sparkles className="w-10 h-10 text-orange mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Tu cherches un objet introuvable ou budget limité ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Dépose une annonce gratuitement et laisse les vendeurs de Dakar te trouver la meilleure offre !
          </p>
          <Link href="/deposer">
            <Button className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg px-8 py-3 text-base h-auto">
              Déposer une annonce
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
