import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, User as UserIcon, Star, ArrowRight, Building2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MobileNavigation from '@/components/MobileNavigation';
import HeroSlider from '@/components/HeroSlider';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, onSnapshot } from 'firebase/firestore';

// Define the interface for our Product data from Firestore
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  category: string;
  badge?: string;
  discount?: string;
  stock: number;
}

// Define interface for Category data
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // 1. Real-time Listener for Products
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(8)); 
    
    const unsubProducts = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(fetchedProducts);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        if (isMounted) setIsLoading(false);
    });

    // 2. Fetch Categories
    const fetchCategories = async () => {
        try {
            const categoriesRef = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesRef);
            
            if (!isMounted) return;

            if (!categorySnapshot.empty) {
                setCategories(categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
            } else {
                // Fallback static data if DB is empty
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

  // Helper to handle adding to cart with correct type
  const handleAddToCart = (product: Product) => {
    // We spread the product properties and explicitly add quantity: 1
    // to satisfy the CartItem interface
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-bright-red-700 to-bright-red-700 bg-clip-text text-transparent">
                🪑 KURCHI
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-stone-700 hover:text-bright-red-700 transition-colors font-medium">Home</Link>
              <Link to="/categories" className="text-stone-700 hover:text-bright-red-700 transition-colors font-medium">Categories</Link>
              <Link to="/new-arrivals" className="text-stone-700 hover:text-bright-red-700 transition-colors font-medium">New Arrivals</Link>
              <Link to="/offers" className="text-stone-700 hover:text-bright-red-700 transition-colors font-medium">Offers</Link>
              <Link to="/about" className="text-stone-700 hover:text-bright-red-700 transition-colors font-medium">About</Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center max-w-md w-full mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input
                  placeholder="Search chairs, sofas..."
                  className="pl-10 pr-4 w-full border-stone-300 focus:border-bright-red-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link to="/wishlist">
                <Button variant="ghost" size="sm" className="hidden md:flex text-stone-600 hover:text-bright-red-700">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative text-stone-600 hover:text-bright-red-700">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* Profile Link - Shows User Name if logged in */}
              <Link to={user ? "/profile" : "/login"}>
                <Button variant="ghost" size="sm" className="hidden md:flex text-stone-600 hover:text-bright-red-700 items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {user && <span className="text-xs font-semibold">{user.name?.split(' ')[0]}</span>}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slider */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSlider />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-stone-600">Find the perfect furniture for every space</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-bright-red-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                <Link to="/categories" key={category.id}>
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-stone-200">
                    <CardContent className="p-6 text-center">
                        <div className="relative mb-4">
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-32 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <h3 className="font-semibold text-lg text-stone-900 mb-2">{category.name}</h3>
                        {category.count !== undefined && (
                            <p className="text-stone-600">{category.count} Products</p>
                        )}
                    </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-br from-stone-50 to-bright-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Featured Products</h2>
            <p className="text-lg text-stone-600">Handpicked favorites for your home and office</p>
            {user?.role === 'business' && (
               <Badge className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                 <Building2 className="w-4 h-4 mr-1" />
                 B2B Pricing Enabled
               </Badge>
            )}
          </div>

          {isLoading ? (
             <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-bright-red-600" />
             </div>
          ) : products.length === 0 ? (
             <div className="text-center py-10 bg-white/50 rounded-xl">
                 <p className="text-stone-500">No products found. (Add items to 'products' collection in Firestore)</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                const displayPrice = getPrice(product.price);
                const isB2B = user?.role === 'business';

                return (
                    <Card key={product.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-stone-200">
                    <div className="relative">
                        <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.badge && (
                            <Badge className="absolute top-3 left-3 bg-bright-red-700 hover:bg-bright-red-800">
                                {product.badge}
                            </Badge>
                        )}
                        {product.discount && (
                            <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
                                {product.discount}
                            </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <Button
                        size="sm"
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-stone-900 hover:bg-stone-100"
                        >
                        <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg text-stone-900 mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                        {product.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{product.rating}</span>
                            </div>
                        )}
                        {product.reviews && (
                             <span className="text-sm text-stone-500">({product.reviews} reviews)</span>
                        )}
                        </div>
                        
                        <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${isB2B ? 'text-blue-700' : 'text-stone-900'}`}>
                            ₹{displayPrice.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-lg text-stone-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {isB2B && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                                Includes GST Input Credit & Bulk Discount
                            </div>
                        )}
                        </div>

                        {product.stock > 0 ? (
                                <Button 
                                  onClick={() => handleAddToCart(product)}
                                  className="w-full bg-bright-red-600"
                                >
                                  Add to Cart
                                </Button>
                              ) : (
                                <Button 
                                  disabled 
                                  className="w-full bg-stone-300 text-stone-600 cursor-not-allowed"
                                >
                                  Out of Stock
                                </Button>
                              )}
                    </CardContent>
                    </Card>
                );
                })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/categories">
              <Button variant="outline" size="lg" className="border-bright-red-700 text-bright-red-700 hover:bg-bright-red-50">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                Submit a product request with your requirements, and our team will help you find the perfect furniture piece or suggest similar alternatives from our catalog.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-bright-red-100 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-bright-red-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Describe Your Needs</h3>
                    <p className="text-stone-600">Tell us about the furniture you're looking for</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-bright-red-100 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-bright-red-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Get Personalized Suggestions</h3>
                    <p className="text-stone-600">Receive curated recommendations from our experts</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-8 bg-bright-red-700 hover:bg-bright-red-800 text-white">
                Submit Product Request
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&crop=center"
                alt="Custom Furniture"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🪑 KURCHI</div>
              <p className="text-stone-400 mb-4">
                Premium furniture for modern living. Quality, comfort, and style in every piece.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-stone-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-stone-400">
                <li><Link to="/categories" className="hover:text-white transition-colors">Office Chairs</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">Sofas</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">Recliners</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">Bean Bags</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-stone-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link to="/request" className="hover:text-white transition-colors">Product Request</Link></li>
                <li><Link to="/bulk" className="hover:text-white transition-colors">Bulk Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400">
            <p>&copy; 2024 Kurchi. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Index;