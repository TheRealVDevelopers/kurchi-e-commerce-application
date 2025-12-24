import { Heart, ShoppingCart, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

const Wishlist = () => {
  const wishlistItems = [
    {
      id: 1,
      name: 'Scandinavian Accent Chair',
      price: 22999,
      originalPrice: 28999,
      rating: 4.9,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop&crop=center',
      inStock: true
    },
    {
      id: 2,
      name: 'Luxury Velvet Sofa',
      price: 68999,
      originalPrice: 79999,
      rating: 4.8,
      reviews: 23,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop&crop=center',
      inStock: true
    },
    {
      id: 3,
      name: 'Ergonomic Office Chair',
      price: 25999,
      originalPrice: 32999,
      rating: 4.7,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=400&fit=crop&crop=center',
      inStock: false
    },
    {
      id: 4,
      name: 'Modern Recliner',
      price: 35999,
      originalPrice: 42999,
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop&crop=center',
      inStock: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">My Wishlist</h1>
            <p className="text-stone-600">{wishlistItems.length} items saved for later</p>
          </div>
          <Button variant="outline" className="border-bright-red-700 text-bright-red-700 hover:bg-bright-red-50">
            Clear All
          </Button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group relative hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                    <Badge className="bg-red-600 text-white">Out of Stock</Badge>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-white hover:bg-red-50 text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-stone-900 mb-2 line-clamp-2">{item.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                  <span className="text-sm text-stone-500">({item.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-stone-900">₹{item.price.toLocaleString()}</span>
                  <span className="text-sm text-stone-500 line-through">₹{item.originalPrice.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-bright-red-700 hover:bg-bright-red-800 text-white"
                    disabled={!item.inStock}
                  >
                    {item.inStock ? 'Add to Cart' : 'Notify When Available'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                    Remove from Wishlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no items) */}
        {wishlistItems.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-stone-900 mb-2">Your wishlist is empty</h2>
            <p className="text-stone-600 mb-8">Start adding items you love to your wishlist</p>
            <Button className="bg-bright-red-700 hover:bg-bright-red-800">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Wishlist;
