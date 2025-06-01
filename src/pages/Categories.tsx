import { useState } from 'react';
import { Search, Filter, Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
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
            <Input placeholder="Search furniture..." className="pl-10" />
          </div>
          <Button variant="outline" className="border-amber-700 text-amber-700">
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
              className={selectedCategory === category.id 
                ? "bg-amber-700 hover:bg-amber-800" 
                : "border-stone-300 hover:border-amber-700"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-amber-700">{product.badge}</Badge>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-stone-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-stone-900 mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-stone-500">({product.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-stone-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-amber-700 hover:bg-amber-800">Add to Cart</Button>
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
