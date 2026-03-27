import { useState, useEffect } from 'react';
import { Search, Star, ArrowRight, Building2, Loader2, Truck, Shield, Headphones, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/MobileNavigation';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, onSnapshot } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
  discount?: string;
  stock: number;
  gallery?: string[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  count?: number;
}

const Index = () => {
  const { user } = useApp();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(8));

    const unsubProducts = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)).filter(p => p.name && p.price != null && p.image && p.stock != null);
      setProducts(fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      if (isMounted) setIsLoading(false);
    });

    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoriesRef);

        if (!isMounted) return;

        if (!categorySnapshot.empty) {
          setCategories(categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        } else {
          setCategories([
            { id: 'cat1', name: 'Office Chairs', image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=300&fit=crop' },
            { id: 'cat2', name: 'Sofas', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop' },
            { id: 'cat3', name: 'Recliners', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
            { id: 'cat4', name: 'Bean Bags', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop' }
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
      unsubProducts();
    };
  }, []);

  const getPrice = (originalPrice: number) => {
    if (user?.role === 'business') {
      return Math.floor(originalPrice * 0.82);
    }
    return originalPrice;
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 });
  };

  const trustBadges = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹2,999' },
    { icon: Shield, title: '2-Year Warranty', desc: 'On all furniture' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: Headphones, title: 'Expert Support', desc: 'Mon–Sat, 10am–7pm' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-0">
      {/* Shared Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <HeroSlider />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-stone-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-stone-200/60">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3 py-5 px-4 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-warm-50 flex items-center justify-center shrink-0">
                  <badge.icon className="w-5 h-5 text-warm-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{badge.title}</p>
                  <p className="text-xs text-stone-400 truncate">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-600 mb-2">Browse</p>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Shop by Category</h2>
            </div>
            <Link to="/categories" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-warm-700 hover:text-warm-800 transition-colors">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link to="/categories" key={category.id}>
                  <Card className="group cursor-pointer bg-white border-stone-200/60 hover:border-warm-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-lg text-white">{category.name}</h3>
                          {category.count !== undefined && (
                            <p className="text-white/70 text-sm">{category.count} Products</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-600 mb-2">Curated for You</p>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Featured Products</h2>
              {user?.role === 'business' && (
                <Badge className="mt-3 bg-blue-600 text-white hover:bg-blue-700">
                  <Building2 className="w-4 h-4 mr-1" />
                  B2B Pricing Enabled
                </Badge>
              )}
            </div>
            <Link to="/categories" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-warm-700 hover:text-warm-800 transition-colors">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-cream rounded-2xl border border-dashed border-stone-200">
              <p className="text-stone-400">No products found. Add items to the 'products' collection in Firestore.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/categories">
              <Button variant="outline" size="lg" className="border-warm-300 text-warm-800 hover:bg-warm-50 hover:border-warm-400 rounded-full px-8">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section — "Can't Find What You're Looking For?" */}
      <section className="py-16 md:py-20 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-600 mb-3">Custom Requests</p>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-base text-stone-500 mb-8 leading-relaxed">
                Submit a product request with your requirements, and our team will help you find the perfect furniture piece or suggest similar alternatives from our catalog.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center shrink-0">
                    <Search className="h-5 w-5 text-warm-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">Describe Your Needs</h3>
                    <p className="text-sm text-stone-500">Tell us about the furniture you're looking for</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 text-warm-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">Get Personalized Suggestions</h3>
                    <p className="text-sm text-stone-500">Receive curated recommendations from our experts</p>
                  </div>
                </div>
              </div>
              <Link to="/contact">
                <Button size="lg" className="mt-8 bg-warm-700 hover:bg-warm-800 text-white rounded-full px-8">
                  Submit Product Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-warm-100/50 rounded-3xl -rotate-2" />
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&crop=center"
                alt="Custom Furniture"
                className="relative w-full h-80 md:h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Index;