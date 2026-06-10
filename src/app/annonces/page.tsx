'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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

const ITEMS_PER_PAGE = 12;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const fetchAnnonces = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      params.set('page', String(pageNum));
      params.set('limit', String(ITEMS_PER_PAGE));
      const res = await fetch(`/api/annonces?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const total = parseInt(res.headers.get('X-Total-Count') || '0');
        setTotalCount(total);
        setAnnonces(data);
        setPage(pageNum);

        // Update URL without full reload
        const urlParams = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') urlParams.set('category', selectedCategory);
        if (searchQuery) urlParams.set('search', searchQuery);
        if (pageNum > 1) urlParams.set('page', String(pageNum));
        const qs = urlParams.toString();
        router.replace(`/annonces${qs ? '?' + qs : ''}`, { scroll: false });
      }
    } catch (error) {
      console.error('Error fetching annonces:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, router]);

  useEffect(() => {
    fetchAnnonces(1);
  }, [selectedCategory, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchAnnonces(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Annonces</h1>
          <p className="text-gray-500 mt-1">
            {totalCount > 0 ? `${totalCount.toLocaleString('fr-FR')} annonce${totalCount !== 1 ? 's' : ''} trouvée${totalCount !== 1 ? 's' : ''}` : 'Aucune annonce'}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {/* First page */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-bg hover:text-orange disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      {/* Previous */}
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-bg hover:text-orange disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((p, i) =>
                        p === '...' ? (
                          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                              p === page
                                ? 'bg-orange text-white'
                                : 'text-gray-600 hover:bg-orange-bg hover:text-orange'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-bg hover:text-orange disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {/* Last page */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-bg hover:text-orange disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      Page {page} sur {totalPages} — {((page - 1) * ITEMS_PER_PAGE + 1)} à {Math.min(page * ITEMS_PER_PAGE, totalCount)} sur {totalCount} annonces
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
