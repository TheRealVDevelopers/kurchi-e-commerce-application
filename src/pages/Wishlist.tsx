import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { documentId, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { toast } from 'sonner';

// Optional prop allows us to embed this inside the Profile tab without the Header
const Wishlist = ({ embedded = false }: { embedded?: boolean }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Firestore 'in' query supports up to 10 items. 
        // For production apps with large wishlists, you'd fetch individually or batch.
        // Here we slice to 10 for safety in this demo.
        const idsToCheck = wishlist.slice(0, 10); 
        
        const q = query(collection(db, 'products'), where(documentId(), 'in', idsToCheck));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const Content = (
    <div className={embedded ? "" : "container mx-auto px-4 py-8"}>
      {!embedded && <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-stone-400" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Heart className="w-12 h-12 mx-auto text-stone-200 mb-4" />
          <h3 className="text-lg font-medium text-stone-900">Your wishlist is empty</h3>
          <p className="text-stone-500">Save items you love to view them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group relative">
              <div className="aspect-square overflow-hidden bg-stone-100 relative">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-stone-600 mb-4">₹{product.price}</p>
                <Button className="w-full" onClick={() => {
                    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
                    toast.success("Moved to Cart");
                }}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) return Content;

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Header />
      {Content}
      <MobileNavigation />
    </div>
  );
};

export default Wishlist;