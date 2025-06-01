import { Heart, ShoppingCart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

const Offers = () => {
  const offers = [
    {
      id: 1,
      name: 'Premium Executive Chair',
      price: 15999,
      originalPrice: 25999,
      discount: 38,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=400&fit=crop&crop=center',
      offerType: 'Flash Sale',
      timeLeft: '2 days left'
    },
    {
      id: 2,
      name: 'Luxury 3-Seater Sofa',
      price: 45999,
      originalPrice: 65999,
      discount: 30,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop&crop=center',
      offerType: 'Weekend Deal',
      timeLeft: '5 days left'
    },
    {
      id: 3,
      name: 'Comfort Bean Bag',
      price: 6999,
      originalPrice: 12999,
      discount: 46,
      rating: 4.6,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop&crop=center',
      offerType: 'Clearance',
      timeLeft: '1 day left'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">🔥 Special Offers</h1>
          <p className="text-lg text-stone-600">Limited time deals on premium furniture</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">MEGA SALE</h2>
          <p className="text-xl mb-4">Up to 50% OFF on selected items</p>
          <Button className="bg-white text-red-600 hover:bg-stone-100">Shop Now</Button>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  {offer.discount}% OFF
                </Badge>
              </div>
              <div className="relative">
                <img 
                  src={offer.image} 
                  alt={offer.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-orange-600 hover:bg-orange-700">{offer.offerType}</Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-stone-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl text-stone-900 mb-3">{offer.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{offer.rating}</span>
                  </div>
                  <span className="text-sm text-stone-500">({offer.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-red-600">₹{offer.price.toLocaleString()}</span>
                  <span className="text-lg text-stone-500 line-through">₹{offer.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 mb-4 text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{offer.timeLeft}</span>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Offers;
