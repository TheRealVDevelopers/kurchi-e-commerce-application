import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Sparkles, ArrowRight, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  createdAt: any;
  salePrice?: number;
}

const NewArrivals = () => {
  const { user } = useApp();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        // Query: Get products, sort by Date (Newest first), Limit to 20
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'), limit(20));
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Helper: B2B Pricing Logic
  const getPrice = (product: Product) => {
    if (user?.role === 'business') {
      // 18% Tax Credit calculation
      return Math.floor(product.price * 0.82); 
    }
    return product.price;
  };

  // Helper: Calculate how many days ago it was added
  const getDaysAgo = (timestamp: any) => {
    if (!timestamp) return 0;
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Header />

      {/* --- HERO BANNER --- */}
      <div className="bg-stone-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-bright-red-600 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-4 text-bright-red-500 font-medium tracking-wide uppercase text-sm">
                <Sparkles className="w-4 h-4" /> Just Landed
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Fresh from the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-bright-red-500 to-orange-500">
                    Design Studio
                </span>
            </h1>
            <p className="text-stone-400 text-lg max-w-xl">
                Be the first to explore our latest collection. Contemporary designs blending modern aesthetics with timeless comfort.
            </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* --- LOADING STATE --- */}
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="h-10 w-10 animate-spin text-bright-red-600" />
          </div>
        ) : products.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-200">
             <h3 className="text-xl font-semibold text-stone-900">No New Items Yet</h3>
             <p className="text-stone-500 mt-2">Check back soon for our latest collection updates.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const displayPrice = getPrice(product);
              const daysAgo = getDaysAgo(product.createdAt);
              const isB2B = user?.role === 'business';

              return (
                <Card key={product.id} className="group overflow-hidden border-stone-200 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Badge: "NEW" or "3 Days Ago" */}
                    <div className="absolute top-3 left-3">
                       {daysAgo <= 7 ? (
                           <Badge className="bg-bright-red-600 text-white shadow-sm border-0 rounded-sm">
                               NEW ARRIVAL
                           </Badge>
                       ) : (
                           <Badge variant="secondary" className="bg-white/90 text-stone-900 backdrop-blur-sm">
                               <Clock className="w-3 h-3 mr-1" /> {daysAgo}d ago
                           </Badge>
                       )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="text-xs text-stone-500 mb-1 uppercase tracking-wider font-semibold">
                        {product.category}
                    </div>
                    <h3 className="font-bold text-stone-900 text-lg mb-2 line-clamp-1">{product.name}</h3>
                    
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                             <span className={`text-xl font-bold ${isB2B ? 'text-blue-700' : 'text-stone-900'}`}>
                                ₹{displayPrice.toLocaleString()}
                             </span>
                             {product.salePrice && (
                                <span className="text-sm text-stone-400 line-through">
                                    ₹{product.price.toLocaleString()}
                                </span>
                             )}
                        </div>
                        {isB2B && (
                            <div className="text-[10px] text-blue-600 font-medium mt-1 flex items-center">
                                <Building2 className="w-3 h-3 mr-1" /> GST Credit Available
                            </div>
                        )}
                    </div>

                    <Button 
                        onClick={() => {
                          addToCart({ 
                              id: product.id, // Ensure ID is passed correctly
                              name: product.name,
                              price: displayPrice,
                              image: product.image,
                              quantity: 1
                          });
                          toast.success(`Added ${product.name} to cart`);
                        }}
                        className="w-full bg-stone-900 hover:bg-stone-800 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <MobileNavigation />
    </div>
  );
};

export default NewArrivals;