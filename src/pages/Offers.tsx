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
      name: 'Summer Living Room Sale',
      discount: 'up to 40% OFF',
      description: 'Upgrade your living space with our premium sofa collection',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=400&fit=crop',
      color: 'bg-bright-red-600',
      category: 'Sofas',
      timeLeft: 'Ends in 2 days'
    },
    {
      id: 2,
      name: 'Work From Home Special',
      discount: 'Flat 20% OFF',
      description: 'Premium ergonomic chairs for your productivity',
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&h=400&fit=crop',
      color: 'bg-stone-800',
      category: 'Office',
      timeLeft: 'Ends in 5 days'
    },
    {
      id: 3,
      name: 'Bundle & Save',
      discount: 'Buy 2 Get 15% OFF',
      description: 'Mix and match your favorite recliners and bean bags',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
      color: 'bg-tomato-700',
      category: 'Recliners',
      timeLeft: 'Ends tonight'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">Special Offers</h1>
          <p className="text-lg text-stone-600">Premium comfort at unbeatable prices</p>
        </div>

        <div className="space-y-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden border-0 shadow-xl group">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-full overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className={`p-8 md:p-12 text-white ${offer.color} flex flex-col justify-center`}>
                  <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white mb-4 border-white/20 text-sm">
                    {offer.category}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">{offer.name}</h2>
                  <div className="text-4xl font-black mb-6 text-white tracking-tight">
                    {offer.discount}
                  </div>
                  <div className="flex items-center gap-2 mb-8">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{offer.timeLeft}</span>
                  </div>
                  <Button className="w-fit bg-white text-stone-900 hover:bg-stone-100 text-lg px-8 h-12 font-semibold">
                    Shop Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Offers;
