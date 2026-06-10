'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnonceCard from '@/components/AnnonceCard';
import { CATEGORIES } from '@/lib/constants';

const categories = [
  { name: 'Toutes', value: 'all' },
  ...CATEGORIES.map(c => ({ name: `${c.emoji} ${c.name}`, value: c.name })),
];

interface Annonce {
  id: string;
  title: string;
  price: number;
  category: string;
  emoji: string;
  location: string;
  type?: string;
  isVip: boolean;
  vipType: string | null;
  createdAt: string;
}

function AnnoncesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchAnnonces = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!append) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      params.set('page', String(pageNum));
      const res = await fetch(`/api/annonces?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const total = parseInt(res.headers.get('X-Total-Count') || '0');
        setTotalCount(total);
        setHasMore(pageNum * 20 < total);
        if (append) {
          setAnnonces(prev => [...prev, ...data]);
        } else {
          setAnnonces(data);
        }
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching annonces:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchAnnonces(1, false);
  }, [fetchAnnonces]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Annonces</h1>
          <p className="text-gray-500 mt-1">
            {annonces.length} annonce{annonces.length !== 1 ? 's' : ''} trouvée{annonces.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-gray-200 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'
            } lg:relative lg:block lg:bg-transparent lg:z-auto`}
            onClick={() => showFilters && setShowFilters(false)}
          >
            <div
              className={`${
                showFilters
                  ? 'fixed right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-xl'
                  : ''
              } lg:w-56 lg:relative lg:p-0 lg:shadow-none`}
              onClick={(e) => e.stopPropagation()}
            >
              {showFilters && (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="font-bold text-lg">Filtres</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
              <h3 className="font-semibold text-gray-900 mb-3 hidden lg:block">Catégories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-orange text-white'
                        : 'text-gray-600 hover:bg-orange-bg hover:text-orange'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {selectedCategory !== 'all' && (
              <div className="mb-4">
                <Badge
                  className="bg-orange-bg text-orange hover:bg-orange/10 font-medium cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  {categories.find((c) => c.value === selectedCategory)?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-2">Aucune annonce trouvée</p>
                <p className="text-gray-400 text-sm">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 stagger-children">
                  {annonces.map((annonce) => (
                    <div key={annonce.id} className="stagger-item">
                      <AnnonceCard {...annonce} />
                    </div>
                  ))}
                </div>
                {/* Load more button */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => fetchAnnonces(page + 1, true)}
                      variant="outline"
                      className="rounded-xl border-orange/30 text-orange hover:bg-orange-bg font-semibold px-8"
                    >
                      Voir plus d&apos;annonces
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      {annonces.length} / {totalCount} annonces affichées
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </main>
        <Footer />
      </div>
    }>
      <AnnoncesContent />
    </Suspense>
  );
}
