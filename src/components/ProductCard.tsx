import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProductModal } from '@/context/ProductModalContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    image: string;
    category: string;
    description: string;
    badge?: string;
    rating?: number;
    reviews?: number;
    stock: number;
    gallery?: string[];
}

const ProductCard = (product: ProductCardProps) => {
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { openProduct } = useProductModal();
    const [adding, setAdding] = useState(false);

    const wishlisted = isInWishlist(product.id);
    const displayPrice = product.salePrice ?? product.price;
    const comparePrice = product.salePrice ? product.price : product.originalPrice;
    const discountPct = comparePrice
        ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
        : null;
    const outOfStock = product.stock <= 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (outOfStock) return;
        setAdding(true);
        await addToCart({
            id: product.id,
            name: product.name,
            price: displayPrice,
            image: product.image,
            quantity: 1,
        });
        setTimeout(() => setAdding(false), 700);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (wishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        openProduct({
            id: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            description: product.description,
            category: product.category,
            image: product.image,
            gallery: product.gallery,
        });
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer">

            {/* Image area */}
            <div
                className="relative overflow-hidden bg-stone-50 aspect-[4/3]"
                onClick={handleQuickView}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {outOfStock && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900 text-white">
                            Out of Stock
                        </span>
                    )}
                    {!outOfStock && product.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warm-600 text-white">
                            {product.badge}
                        </span>
                    )}
                    {!outOfStock && discountPct && discountPct > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500 text-white">
                            -{discountPct}%
                        </span>
                    )}
                </div>

                {/* Wishlist button */}
                <button
                    onClick={handleWishlist}
                    className={cn(
                        'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                        'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0',
                        wishlisted
                            ? 'bg-warm-50 text-warm-600'
                            : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-warm-600 hover:bg-warm-50'
                    )}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        className="w-4 h-4 transition-transform duration-200 hover:scale-110"
                        fill={wishlisted ? 'currentColor' : 'none'}
                    />
                </button>

                {/* Quick view pill — appears on hover, centered bottom */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={handleQuickView}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-stone-800 text-xs font-semibold shadow-lg hover:bg-white transition-colors whitespace-nowrap"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Quick view
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
                {/* Category */}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
                    {product.category}
                </p>

                {/* Name */}
                <h3
                    className="text-[15px] font-semibold text-stone-900 leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-warm-700 transition-colors"
                    onClick={handleQuickView}
                >
                    {product.name}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    className="w-3 h-3"
                                    style={{
                                        fill: s <= Math.round(product.rating!) ? '#fbbf24' : 'transparent',
                                        color: s <= Math.round(product.rating!) ? '#fbbf24' : '#d1d5db',
                                    }}
                                />
                            ))}
                        </div>
                        {product.reviews && (
                            <span className="text-xs text-stone-400">({product.reviews})</span>
                        )}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-stone-900 leading-none">
                            ₹{displayPrice.toLocaleString()}
                        </span>
                        {comparePrice && comparePrice > displayPrice && (
                            <span className="text-xs text-stone-400 line-through leading-none mt-0.5">
                                ₹{comparePrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={outOfStock || adding}
                        className={cn(
                            'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                            outOfStock
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : adding
                                    ? 'bg-green-600 text-white scale-95'
                                    : 'bg-stone-900 text-white hover:bg-warm-700 hover:scale-105 active:scale-95'
                        )}
                    >
                        {adding ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Adding
                            </>
                        ) : outOfStock ? (
                            'Sold out'
                        ) : (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;