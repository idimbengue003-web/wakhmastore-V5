'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Zap, Shield, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnonceCard from '@/components/AnnonceCard';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

import { CATEGORIES, QUICK_CATEGORIES } from '@/lib/constants';

interface Annonce {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  category: string;
  emoji: string;
  location: string;
  type?: string;
  isVip: boolean;
  vipType: string | null;
  authorName?: string;
  createdAt: string;
  coverImageUrl?: string | null;
  imageCount?: number;
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input to avoid spamming navigations
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchAnnonces() {
      try {
        // Cache navigateur + SWR : si on a déjà fetch récemment, on réutilise.
        // Le cache permet aussi de naviguer back/forward sans refetch.
        const res = await fetch('/api/annonces?limit=8', {
          next: { revalidate: 30 }, // cache 30s côté Next.js data cache
          headers: { 'Cache-Control': 'max-age=30' },
        });
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
      <section className="relative bg-gradient-to-r from-orange-dark to-orange overflow-hidden">
        {/* Floating emojis - subtle & transparent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="floating-emoji opacity-10" style={{ '--float-x': '5%', '--float-delay': '0s', '--float-duration': '10s', '--float-size': '1.4rem' } as React.CSSProperties}>📱</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '15%', '--float-delay': '1.5s', '--float-duration': '12s', '--float-size': '1.3rem' } as React.CSSProperties}>📺</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '25%', '--float-delay': '3s', '--float-duration': '10s', '--float-size': '1.5rem' } as React.CSSProperties}>💻</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '35%', '--float-delay': '0.8s', '--float-duration': '11s', '--float-size': '1.2rem' } as React.CSSProperties}>🧊</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '45%', '--float-delay': '2.2s', '--float-duration': '9s', '--float-size': '1.4rem' } as React.CSSProperties}>🚗</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '55%', '--float-delay': '3.8s', '--float-duration': '12s', '--float-size': '1.3rem' } as React.CSSProperties}>🏠</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '65%', '--float-delay': '1.8s', '--float-duration': '10s', '--float-size': '1.6rem' } as React.CSSProperties}>👗</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '75%', '--float-delay': '0.4s', '--float-duration': '10s', '--float-size': '1.2rem' } as React.CSSProperties}>🔊</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '82%', '--float-delay': '3.4s', '--float-duration': '12s', '--float-size': '1.4rem' } as React.CSSProperties}>🛋️</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '90%', '--float-delay': '1.1s', '--float-duration': '11s', '--float-size': '1.3rem' } as React.CSSProperties}>📦</span>
          <span className="floating-emoji opacity-5" style={{ '--float-x': '10%', '--float-delay': '4.5s', '--float-duration': '13s', '--float-size': '1.1rem' } as React.CSSProperties}>🔧</span>
          <span className="floating-emoji opacity-5" style={{ '--float-x': '50%', '--float-delay': '5.2s', '--float-duration': '10s', '--float-size': '1.2rem' } as React.CSSProperties}>💄</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '70%', '--float-delay': '2.6s', '--float-duration': '9s', '--float-size': '1.4rem' } as React.CSSProperties}>🍜</span>
          <span className="floating-emoji opacity-5" style={{ '--float-x': '30%', '--float-delay': '6s', '--float-duration': '11s', '--float-size': '1.3rem' } as React.CSSProperties}>📲</span>
          <span className="floating-emoji opacity-5" style={{ '--float-x': '88%', '--float-delay': '4.1s', '--float-duration': '10s', '--float-size': '1.1rem' } as React.CSSProperties}>❄️</span>
          <span className="floating-emoji opacity-10" style={{ '--float-x': '42%', '--float-delay': '6.8s', '--float-duration': '12s', '--float-size': '1.2rem' } as React.CSSProperties}>⚡</span>
        </div>

        <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center">
          <h1 className="wakhma-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-10 tracking-tight">
            <span className="text-blue-300">W</span>akhma Store
          </h1>
          <p className="text-white/95 mb-12 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-medium leading-relaxed">
            La marketplace sénégalaise pour acheter et vendre.
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
                href={debouncedSearch ? `/annonces?search=${encodeURIComponent(debouncedSearch)}` : '/annonces'}
              >
                <Button className="btn-press bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg px-6 h-12">
                  Rechercher
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_CATEGORIES.map((cat) => (
              <Link key={cat} href={`/annonces?category=${encodeURIComponent(cat)}`}>
                <span className="category-pill inline-flex items-center px-4 py-2 rounded-full bg-white/25 text-white text-sm font-medium backdrop-blur-sm cursor-pointer">
                  {CATEGORIES.find((c) => c.name === cat)?.emoji} {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Annonces récentes */}
      <Section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Annonces récentes
            </h2>
            <p className="text-gray-600 mt-1">Les dernières demandes postées sur Wakhma Store</p>
          </div>
          <Link href="/annonces">
            <Button variant="ghost" className="btn-press text-orange hover:text-orange-dark hover:bg-orange-bg font-semibold">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-orange-bg h-44 sm:h-52" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
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
              <Button className="btn-press mt-4 bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                Déposer la première annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 stagger-children">
            {annonces.slice(0, 8).map((annonce) => (
              <div key={annonce.id} className="stagger-item">
                <AnnonceCard {...annonce} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Catégories */}
      <Section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Explorez les catégories
            </h2>
            <p className="text-gray-600 mt-1">Trouvez ce que vous cherchez en un clic</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4 stagger-children">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/annonces?category=${encodeURIComponent(cat.name)}`}
                className="stagger-item group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white border border-gray-100 hover:border-orange/30 hover:shadow-md transition-all duration-300 ease-out"
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-300 ease-out">
                  {cat.emoji}
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange transition-colors duration-300 text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Features - Rapide/Fiable/Efficace */}
      <Section className="bg-gradient-to-br from-orange-dark to-orange py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Pourquoi Wakhma Store ?
            </h2>
            <p className="text-white/90 mt-1">Rapide, fiable et efficace</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
            <div className="stagger-item feature-card bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Rapide</h3>
              <p className="text-gray-600 text-sm">
                Postez votre demande en quelques secondes et recevez des réponses rapidement.
              </p>
            </div>
            <div className="stagger-item feature-card bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Fiable</h3>
              <p className="text-gray-600 text-sm">
                Des vendeurs vérifiés et un système de confiance pour vos transactions.
              </p>
            </div>
            <div className="stagger-item feature-card bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm">
              <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-orange" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Efficace</h3>
              <p className="text-gray-600 text-sm">
                Trouvez exactement ce que vous cherchez au meilleur prix à Dakar.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-orange-bg/70 rounded-2xl p-8 sm:p-12 text-center border border-orange/20">
          <Sparkles className="w-10 h-10 text-orange mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Tu cherches un objet introuvable ou budget limité ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Dépose une annonce gratuitement et laisse les vendeurs de Dakar te trouver la meilleure offre !
          </p>
          <Link href="/deposer">
            <Button className="btn-press bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg px-8 py-3 text-base h-auto">
              Déposer une annonce
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
