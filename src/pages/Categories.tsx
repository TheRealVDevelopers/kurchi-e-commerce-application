import { useState } from 'react';
import { Search, Filter, Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'office', name: 'Office Chairs' },
    { id: 'sofas', name: 'Sofas' },
    { id: 'recliners', name: 'Recliners' },
    { id: 'beanbags', name: 'Bean Bags' },
    { id: 'dining', name: 'Dining Chairs' },
    { id: 'lounge', name: 'Lounge Chairs' }
  ];

  const products = [
    {
      id: 1,
      name: 'Executive Leather Chair',
      price: 18999,
      originalPrice: 24999,
      category: 'office',
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=400&fit=crop&crop=center',
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Modern Sectional Sofa',
      price: 55999,
      originalPrice: 69999,
      category: 'sofas',
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop&crop=center',
      badge: 'Premium'
    },
    {
      id: 3,
      name: 'Comfort Recliner',
      price: 32999,
      originalPrice: 39999,
      category: 'recliners',
      rating: 4.7,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop&crop=center',
      badge: 'New'
    },
    {
      id: 4,
      name: 'Gaming Bean Bag',
      price: 8999,
      originalPrice: 12999,
      category: 'beanbags',
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop&crop=center',
      badge: 'Sale'
    }
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50 pb-20 md:pb-0">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Shop by Categories</h1>
          <p className="text-stone-600">Find the perfect furniture for every space</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
            <Input placeholder="Search furniture..." className="pl-10 h-11" />
          </div>
          <Button variant="outline" className="border-stone-200 hover:bg-stone-50 text-stone-700 h-11">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "rounded-full px-6",
                selectedCategory === category.id
                  ? "bg-bright-red-700 hover:bg-bright-red-800 text-white border-0"
                  : "border-stone-200 hover:border-bright-red-700 text-stone-600 hover:text-bright-red-700"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-stone-100 overflow-hidden">
              <div className="relative aspect-[4/5]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-bright-red-700 hover:bg-bright-red-800 text-white border-0 shadow-md">
                  {product.badge}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white text-stone-900"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-stone-900 mb-2 truncate group-hover:text-bright-red-700 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-stone-500">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-xs text-stone-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                  <Button size="sm" className="bg-bright-red-700 hover:bg-bright-red-800 text-white shadow-md">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Categories;
