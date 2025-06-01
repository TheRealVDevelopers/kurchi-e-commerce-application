
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NewArrivals = () => {
  const newProducts = [
    {
      id: 1,
      name: 'Scandinavian Accent Chair',
      price: 22999,
      originalPrice: 28999,
      rating: 4.9,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop&crop=center',
      arrivalDate: '2024-05-15'
    },
    {
      id: 2,
      name: 'Modern Velvet Sofa',
      price: 68999,
      originalPrice: 79999,
      rating: 4.8,
      reviews: 23,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop&crop=center',
      arrivalDate: '2024-05-20'
    },
    {
      id: 3,
      name: 'Ergonomic Work Chair',
      price: 25999,
      originalPrice: 32999,
      rating: 4.7,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=400&fit=crop&crop=center',
      arrivalDate: '2024-05-18'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              🪑 KURCHI
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-600">3</Badge>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">New Arrivals</h1>
          <p className="text-lg text-stone-600">Fresh designs just landed in our collection</p>
        </div>

        {/* New Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700">NEW</Badge>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-stone-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl text-stone-900 mb-3">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-stone-500">({product.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-lg text-stone-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                </div>
                <p className="text-sm text-stone-500 mb-4">Arrived: {new Date(product.arrivalDate).toLocaleDateString()}</p>
                <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
