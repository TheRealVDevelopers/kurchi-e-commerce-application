import { useState, useEffect, useRef } from 'react';
import { Loader2, ShoppingCart, ArrowRight, Clock, Zap } from 'lucide-react';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OfferProduct {
    id: string;
    name: string;
    price: number;
    salePrice: number;
    image: string;
    category: string;
    description: string;
    discountPct: number;
    stock: number;
}

// ── Countdown timer hook ──
const useCountdown = () => {
    const getTarget = () => {
        const t = new Date();
        t.setHours(23, 59, 59, 999);
        return t;
    };
    const calc = () => {
        const diff = getTarget().getTime() - Date.now();
        if (diff <= 0) return { h: 0, m: 0, s: 0 };
        return {
            h: Math.floor(diff / 3_600_000),
            m: Math.floor((diff % 3_600_000) / 60_000),
            s: Math.floor((diff % 60_000) / 1000),
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
};

const Pad = (n: number) => String(n).padStart(2, '0');

const TimerUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-black text-stone-900 leading-none tabular-nums">
            {Pad(value)}
        </span>
        <span className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 font-semibold">
            {label}
        </span>
    </div>
);

const Colon = () => (
    <span className="text-xl font-black text-stone-300 leading-none mb-1">:</span>
);

const Offers = () => {
    const [offers, setOffers] = useState<OfferProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const { addToCart } = useCart();
    const time = useCountdown();

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'products')));
                const items: OfferProduct[] = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    if (d.salePrice && d.salePrice < d.price && d.stock > 0) {
                        items.push({
                            id: doc.id,
                            ...d,
                            discountPct: Math.round(((d.price - d.salePrice) / d.price) * 100),
                        } as OfferProduct);
                    }
                });
                items.sort((a, b) => b.discountPct - a.discountPct);
                setOffers(items);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    const handleAdd = async (item: OfferProduct) => {
        setAddingId(item.id);
        await addToCart({ id: item.id, name: item.name, price: item.salePrice, image: item.image, quantity: 1 });
        toast.success(`${item.name} added to cart`);
        setTimeout(() => setAddingId(null), 700);
    };

    const hero = offers[0] ?? null;
    const rest = offers.slice(1);

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-0">
            <Header />

            {/* ── Sale banner strip ── */}
            <div className="bg-stone-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-white leading-none">Flash Sale — Ends Today</p>
                            <p className="text-xs text-stone-400 mt-0.5">Limited stock. Prices drop at midnight.</p>
                        </div>
                    </div>
                    {/* Countdown */}
                    <div className="flex items-end gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                        <Clock className="w-4 h-4 text-stone-400 mb-1 mr-1 shrink-0" />
                        <TimerUnit value={time.h} label="hrs" />
                        <Colon />
                        <TimerUnit value={time.m} label="min" />
                        <Colon />
                        <TimerUnit value={time.s} label="sec" />
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page title */}
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Today Only</p>
                    <h1 className="text-3xl font-black text-stone-900">
                        Flash Deals
                        {offers.length > 0 && (
                            <span className="ml-3 text-base font-semibold text-stone-400">
                                {offers.length} offers
                            </span>
                        )}
                    </h1>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
                    </div>
                ) : offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-stone-200 rounded-3xl">
                        <p className="text-stone-400 text-sm font-medium">No active deals right now.</p>
                        <p className="text-stone-300 text-xs mt-1">Check back soon — new offers drop daily.</p>
                    </div>
                ) : (
                    <div className="space-y-10">

                        {/* ── Hero deal ── */}
                        {hero && (
                            <div className="group relative rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 hover:border-stone-200 hover:shadow-[0_16px_64px_-16px_rgba(0,0,0,0.12)] transition-all duration-500">
                                <div className="grid md:grid-cols-2 min-h-[360px]">

                                    {/* Image */}
                                    <div className="relative overflow-hidden bg-stone-100 min-h-[260px] md:min-h-full">
                                        <img
                                            src={hero.image}
                                            alt={hero.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {/* Discount ribbon */}
                                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold">
                                                <Zap className="w-3 h-3 fill-white" />
                                                Best Deal
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                                                -{hero.discountPct}% OFF
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col justify-center p-8 md:p-12">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                                            {hero.category}
                                        </p>
                                        <h2 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight mb-3">
                                            {hero.name}
                                        </h2>
                                        <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {hero.description}
                                        </p>

                                        <div className="flex items-end gap-3 mb-8">
                                            <span className="text-4xl font-black text-stone-900 leading-none">
                                                ₹{hero.salePrice.toLocaleString()}
                                            </span>
                                            <div className="pb-1 flex flex-col gap-0.5">
                                                <span className="text-stone-400 line-through text-sm leading-none">
                                                    ₹{hero.price.toLocaleString()}
                                                </span>
                                                <span className="text-emerald-600 text-xs font-bold leading-none">
                                                    Save ₹{(hero.price - hero.salePrice).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAdd(hero)}
                                            disabled={addingId === hero.id}
                                            className={cn(
                                                'flex items-center justify-center gap-2 w-full md:w-auto md:px-8 h-12 rounded-xl font-bold text-sm transition-all duration-200',
                                                addingId === hero.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-stone-900 text-white hover:bg-warm-700 hover:scale-[1.02] active:scale-[0.98]'
                                            )}
                                        >
                                            {addingId === hero.id ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Adding to Cart
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Grab This Deal
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Rest of deals grid ── */}
                        {rest.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-stone-800 mb-5">More Deals</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {rest.map(item => (
                                        <div
                                            key={item.id}
                                            className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
                                        >
                                            {/* Image */}
                                            <div className="relative overflow-hidden bg-stone-50 aspect-[4/3]">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold">
                                                    -{item.discountPct}%
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
                                                    {item.category}
                                                </p>
                                                <h3 className="font-semibold text-stone-900 text-[15px] leading-snug mb-3 line-clamp-2">
                                                    {item.name}
                                                </h3>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xl font-black text-stone-900">
                                                            ₹{item.salePrice.toLocaleString()}
                                                        </span>
                                                        <span className="ml-2 text-sm text-stone-400 line-through">
                                                            ₹{item.price.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleAdd(item)}
                                                        disabled={addingId === item.id}
                                                        className={cn(
                                                            'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                                                            addingId === item.id
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-stone-900 text-white hover:bg-warm-700 hover:scale-110 active:scale-95'
                                                        )}
                                                    >
                                                        {addingId === item.id ? (
                                                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <ShoppingCart className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>

            <MobileNavigation />
        </div>
    );
};

export default Offers;