import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface SlideProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock: number;
}

// Accent colors that cycle per slide for visual variety
const ACCENTS = ['#c93922', '#8c0000', '#b30000'];

const HeroSlider = () => {
  const [slides, setSlides] = useState<SlideProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToCart } = useCart();

  // ── Fetch featured products from Firestore ──
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // Strategy 1: Products that have a badge (e.g., "Bestseller", "New", "Hot")
        const badgeSnap = await getDocs(
          query(collection(db, 'products'), where('badge', '!=', null), limit(3))
        );

        let products: SlideProduct[] = badgeSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as SlideProduct))
          .filter(p => p.stock > 0);

        // Strategy 2: If not enough badged items, fill with sale items
        if (products.length < 3) {
          const saleSnap = await getDocs(
            query(collection(db, 'products'), where('salePrice', '!=', null), limit(3))
          );
          const saleProducts = saleSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as SlideProduct))
            .filter(p => p.stock > 0 && !products.find(existing => existing.id === p.id));
          products = [...products, ...saleProducts].slice(0, 3);
        }

        // Strategy 3: Fall back to newest products if still not enough
        if (products.length < 3) {
          const fallbackSnap = await getDocs(
            query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6))
          );
          const fallback = fallbackSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as SlideProduct))
            .filter(p => p.stock > 0 && !products.find(e => e.id === p.id));
          products = [...products, ...fallback].slice(0, 3);
        }

        setSlides(products);
      } catch (err) {
        console.error('HeroSlider fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // ── Auto-advance timer ──
  const resetTimer = (idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => go(idx + 1, 'right'), 5500);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    resetTimer(current);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, slides.length]);

  const go = (index: number, dir: 'left' | 'right') => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrent(((index % slides.length) + slides.length) % slides.length);
      setIsAnimating(false);
    }, 400);
  };

  const handleAddToCart = (slide: SlideProduct) => {
    addToCart({
      id: slide.id,
      name: slide.name,
      price: slide.salePrice || slide.price,
      image: slide.image,
      quantity: 1,
    });
    toast.success(`${slide.name} added to cart`);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div
        className="w-full rounded-3xl bg-stone-900 flex items-center justify-center"
        style={{ minHeight: 520 }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
      </div>
    );
  }

  // ── No products ──
  if (slides.length === 0) return null;

  const slide = slides[current];
  const accent = ACCENTS[current % ACCENTS.length];
  const displayPrice = slide.salePrice || slide.price;
  const hasDiscount = slide.salePrice && slide.salePrice < slide.price;
  const discountPct = hasDiscount
    ? Math.round(((slide.price - slide.salePrice!) / slide.price) * 100)
    : null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl shadow-2xl select-none"
      style={{ minHeight: 520, background: '#0f0f0f' }}
    >
      {/* ── Background image ── */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.45s ease',
        }}
      >
        <img
          src={slide.image}
          alt={slide.name}
          className="w-full h-full object-cover"
          style={{ minHeight: 520 }}
        />
        {/* Layered gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* ── Decorative glow blobs ── */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: accent,
          opacity: 0.12,
          filter: 'blur(80px)',
          transition: 'background 0.6s ease',
        }}
      />
      <div
        className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: accent,
          opacity: 0.08,
          filter: 'blur(100px)',
        }}
      />

      {/* ── Dot indicators (top-right) ── */}
      <div className="absolute top-5 right-5 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > current ? 'right' : 'left')}
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                background: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
              }}
            />
          </button>
        ))}
      </div>

      {/* ── Thumbnail strip (desktop only) ── */}
      {slides.length > 1 && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i, i > current ? 'right' : 'left')}
              className="rounded-xl overflow-hidden border-2 transition-all duration-300"
              style={{
                width: 60,
                height: 60,
                borderColor: i === current ? '#fff' : 'rgba(255,255,255,0.2)',
                opacity: i === current ? 1 : 0.45,
                transform: i === current ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Main slide content ── */}
      <div
        className="relative z-20 flex flex-col justify-end h-full"
        style={{ minHeight: 520 }}
      >
        <div
          className="px-8 md:px-14 pb-12 pt-24 max-w-2xl"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating
              ? `translateX(${direction === 'right' ? '-20px' : '20px'})`
              : 'translateX(0)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* Badge pill + slide counter */}
          <div className="flex items-center gap-3 mb-4">
            {slide.badge ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white"
                style={{
                  background: accent,
                  boxShadow: `0 0 18px ${accent}77`,
                }}
              >
                <Sparkles className="w-3 h-3" />
                {slide.badge}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white"
                style={{
                  background: accent,
                  boxShadow: `0 0 18px ${accent}77`,
                }}
              >
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
            <span className="text-white/40 text-xs font-mono tracking-widest">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Category label */}
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: accent }}
          >
            {slide.category}
          </p>

          {/* Product name */}
          <h2
            className="font-black text-white leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)' }}
          >
            {slide.name}
          </h2>

          {/* Description */}
          <p className="text-stone-300 text-sm md:text-base leading-relaxed mb-5 max-w-lg line-clamp-2">
            {slide.description}
          </p>

          {/* Star rating (if available) */}
          {slide.rating && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className="w-4 h-4"
                    style={{
                      fill: star <= Math.round(slide.rating!) ? '#facc15' : 'transparent',
                      color: star <= Math.round(slide.rating!) ? '#facc15' : '#6b7280',
                    }}
                  />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">{slide.rating}</span>
              {slide.reviews && (
                <span className="text-stone-500 text-sm">
                  ({slide.reviews.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Price + CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Pricing */}
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">
                ₹{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <div className="flex flex-col pb-1 gap-0.5">
                  <span className="text-stone-500 line-through text-sm leading-none">
                    ₹{slide.price.toLocaleString()}
                  </span>
                  <span className="text-green-400 text-xs font-bold leading-none">
                    {discountPct}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <Button
              onClick={() => handleAddToCart(slide)}
              size="lg"
              className="h-12 px-7 rounded-full font-bold text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)`,
                boxShadow: `0 8px 28px ${accent}55`,
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>

            {/* Secondary CTA */}
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-6 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              onClick={() => (window.location.href = `/categories?filter=${encodeURIComponent(slide.category)}`)}
            >
              View Collection
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Arrow controls ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(current - 1, 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/15 hover:border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(current + 1, 'right')}
            className="absolute right-[88px] lg:right-[84px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/15 hover:border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-30">
        <div
          key={`${current}-bar`}
          className="h-full"
          style={{
            background: accent,
            animation: 'heroProgress 5.5s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;