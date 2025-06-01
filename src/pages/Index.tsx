
import { useState } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: 'Office Chairs', count: 45, image: '/placeholder.svg' },
    { name: 'Sofas', count: 32, image: '/placeholder.svg' },
    { name: 'Recliners', count: 18, image: '/placeholder.svg' },
    { name: 'Bean Bags', count: 12, image: '/placeholder.svg' }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Executive Chair',
      price: 15999,
      originalPrice: 19999,
      rating: 4.8,
      reviews: 124,
      image: '/placeholder.svg',
      badge: 'Best Seller',
      discount: '20% OFF'
    },
    {
      id: 2,
      name: 'Luxury 3-Seater Sofa',
      price: 45999,
      originalPrice: 55999,
      rating: 4.9,
      reviews: 89,
      image: '/placeholder.svg',
      badge: 'Premium',
      discount: '18% OFF'
    },
    {
      id: 3,
      name: 'Ergonomic Gaming Chair',
      price: 12999,
      originalPrice: 16999,
      rating: 4.7,
      reviews: 156,
      image: '/placeholder.svg',
      badge: 'New',
      discount: '24% OFF'
    },
    {
      id: 4,
      name: 'Recliner Massage Chair',
      price: 35999,
      originalPrice: 42999,
      rating: 4.6,
      reviews: 67,
      image: '/placeholder.svg',
      badge: 'Trending',
      discount: '16% OFF'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                🪑 KURCHI
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Categories</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">New Arrivals</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Offers</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">About</a>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center max-w-md w-full mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search chairs, sofas..." 
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-600">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search chairs, sofas..." className="pl-10" />
              </div>
              <nav className="space-y-2">
                <a href="#" className="block py-2 text-gray-700">Home</a>
                <a href="#" className="block py-2 text-gray-700">Categories</a>
                <a href="#" className="block py-2 text-gray-700">New Arrivals</a>
                <a href="#" className="block py-2 text-gray-700">Offers</a>
                <a href="#" className="block py-2 text-gray-700">About</a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  New Collection 2024
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Premium
                  <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Furniture
                  </span>
                  for Modern Living
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Discover our curated collection of chairs, sofas, and seating solutions designed for comfort and style.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                  View Categories
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <img 
                  src="/placeholder.svg" 
                  alt="Premium Chair" 
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold text-amber-600">₹15,999</div>
                  <div className="text-sm text-gray-500">Starting from</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find the perfect furniture for every space</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.count} Products</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked favorites for your home and office</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-amber-600 hover:bg-amber-700">
                    {product.badge}
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
                    {product.discount}
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <Button 
                    size="sm" 
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-amber-600 text-amber-600 hover:bg-amber-50">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Submit a product request with your requirements, and our team will help you find the perfect furniture piece or suggest similar alternatives from our catalog.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Describe Your Needs</h3>
                    <p className="text-gray-600">Tell us about the furniture you're looking for</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get Personalized Suggestions</h3>
                    <p className="text-gray-600">Receive curated recommendations from our experts</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-8 bg-amber-600 hover:bg-amber-700 text-white">
                Submit Product Request
              </Button>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Custom Furniture" 
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🪑 KURCHI</div>
              <p className="text-gray-400 mb-4">
                Premium furniture for modern living. Quality, comfort, and style in every piece.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Office Chairs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sofas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recliners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bean Bags</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Request</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bulk Orders</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kurchi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
