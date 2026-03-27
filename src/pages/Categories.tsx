import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import ProductCard, { ProductCardProps } from '@/components/ProductCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

// Soft background tints to alternate across category cards
const TINTS = [
  'bg-stone-100',
  'bg-red-50',
  'bg-amber-50',
  'bg-emerald-50',
  'bg-sky-50',
  'bg-violet-50',
];

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('filter');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setProducts([]);
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    } else {
      fetchCategories();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const map = new Map<string, Category>();
      snap.docs.forEach(doc => {
        const d = doc.data();
        const name = d.category || 'Uncategorized';
        if (map.has(name)) {
          map.get(name)!.count += 1;
        } else {
          map.set(name, { id: name, name, image: d.image, count: 1 });
        }
      });
      setCategories(Array.from(map.values()));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (cat: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, 'products'), where('category', '==', cat))
      );
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCardProps)));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 md:pb-16">

        {/* Page header */}
        <div className="mb-10">
          {selectedCategory ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchParams({})}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All Categories
              </button>
              <div>
                <h1 className="text-2xl font-black text-stone-900">{selectedCategory}</h1>
                <p className="text-sm text-stone-400 mt-0.5">{products.length} products</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
                Browse
              </p>
              <h1 className="text-3xl font-black text-stone-900">Collections</h1>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
          </div>
        ) : selectedCategory ? (

          /* ── Product grid ── */
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-stone-400 text-sm">No products in this category yet.</p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 text-sm font-medium text-stone-900 underline underline-offset-4"
              >
                Browse all categories
              </button>
            </div>
          )

        ) : (

          /* ── Category grid ── */
          categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ filter: cat.name })}
                  className="group relative rounded-2xl overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  style={{ aspectRatio: '4/3' }}
                >
                  {/* Image */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80" />

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-0.5 font-medium">
                      {cat.count} {cat.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                    <ArrowLeft className="w-4 h-4 text-stone-900 rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-stone-400 text-sm">No categories found.</p>
            </div>
          )
        )}
      </main>

      <MobileNavigation />
    </div>
  );
};

export default Categories;