import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, Timer, Flame, Zap, ArrowRight, Star } from 'lucide-react';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

// --- HELPER COMPONENT: COUNTDOWN TIMER ---
const CountdownTimer = () => {
    // A fake timer that counts down from 24 hours for urgency effect
    const [time, setTime] = useState({ hours: 11, minutes: 59, seconds: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex gap-2 text-xs font-mono text-red-600 font-bold items-center bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <Timer className="w-3 h-3" />
            <span>{String(time.hours).padStart(2, '0')}h : {String(time.minutes).padStart(2, '0')}m : {String(time.seconds).padStart(2, '0')}s</span>
        </div>
    );
};

// --- MAIN PAGE ---
const Offers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        
        const saleItems: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.salePrice && data.salePrice < data.price) {
                // Calculate discount %
                const discount = Math.round(((data.price - data.salePrice) / data.price) * 100);
                saleItems.push({ id: doc.id, ...data, discountPercent: discount });
            }
        });

        // Sort by biggest discount (Highest % first)
        saleItems.sort((a, b) => b.discountPercent - a.discountPercent);
        setOffers(saleItems);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Separate the "Hero" deal (The #1 biggest discount)
  const heroDeal = offers.length > 0 ? offers[0] : null;
  const otherDeals = offers.length > 0 ? offers.slice(1) : [];

  const handleAddToCart = (product: any) => {
    addToCart({ 
        ...product, 
        price: product.salePrice, 
        quantity: 1 
    });
    toast.success(` grabbed the deal for ${product.name}!`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-400 rounded-xl shadow-lg rotate-3">
                <Flame className="w-8 h-8 text-red-900 fill-red-600" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-stone-900 tracking-tight">FLASH SALE</h1>
                <p className="text-stone-500 font-medium">Limited time offers. Once they're gone, they're gone.</p>
            </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          </div>
        ) : offers.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
             <h3 className="text-xl font-bold text-stone-400">No Active Deals</h3>
           </div>
        ) : (
          <div className="space-y-12">

            {/* --- HERO DEAL (The #1 Best Offer) --- */}
            {heroDeal && (
                <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-2xl ring-4 ring-yellow-400/50 transform hover:scale-[1.01] transition-all duration-500">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-400 rotate-45 z-10 flex items-end justify-center pb-4 shadow-lg">
                        <span className="text-red-900 font-black text-xl">{heroDeal.discountPercent}% OFF</span>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="p-8 md:p-12 flex flex-col justify-center relative z-20">
                            <div className="inline-flex items-center gap-2 text-yellow-400 font-bold tracking-wider text-sm mb-4 uppercase">
                                <Zap className="w-4 h-4 fill-current" />
                                Deal of the Day
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black leading-tight mb-4">
                                {heroDeal.name}
                            </h2>
                            <p className="text-stone-300 text-lg mb-8 line-clamp-2">{heroDeal.description}</p>
                            
                            <div className="flex items-end gap-4 mb-8">
                                <div>
                                    <p className="text-stone-400 text-lg line-through decoration-red-500 decoration-2">₹{heroDeal.price.toLocaleString()}</p>
                                    <p className="text-5xl font-black text-yellow-400 tracking-tighter">
                                        ₹{heroDeal.salePrice.toLocaleString()}
                                    </p>
                                </div>
                                <CountdownTimer />
                            </div>

                            <Button 
                                onClick={() => handleAddToCart(heroDeal)}
                                className="h-14 text-lg bg-yellow-400 text-red-900 hover:bg-yellow-300 font-bold px-8 w-fit rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                            >
                                CLAIM DEAL NOW <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                        <div className="relative h-64 lg:h-auto">
                            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-stone-900/50 to-stone-900 z-10"></div>
                            <img src={heroDeal.image} className="w-full h-full object-cover" alt="Hero Deal" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- GRID DEALS (The Rest) --- */}
            {otherDeals.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> 
                        More Hot Deals
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherDeals.map((item) => (
                            <div key={item.id} className="group relative bg-white rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                
                                {/* Image Area */}
                                <div className="relative h-64 overflow-hidden bg-stone-100">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    
                                    {/* Floating Badge */}
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse">
                                        -{item.discountPercent}%
                                    </div>

                                    {/* Quick Action Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Button 
                                            onClick={() => handleAddToCart(item)}
                                            className="bg-white text-stone-900 hover:bg-stone-100 rounded-full font-bold px-6"
                                        >
                                            Quick Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-stone-900 line-clamp-1">{item.name}</h3>
                                        <Badge variant="outline" className="border-stone-200 text-stone-400 text-[10px]">{item.category}</Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 p-3 bg-stone-50 rounded-xl">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-stone-400 line-through">₹{item.price}</span>
                                            <span className="text-xl font-black text-red-600">₹{item.salePrice}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleAddToCart(item)}
                                            className="h-10 w-10 bg-stone-900 rounded-full flex items-center justify-center text-white hover:bg-stone-800 hover:scale-110 transition-all"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <CountdownTimer />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
};

export default Offers;