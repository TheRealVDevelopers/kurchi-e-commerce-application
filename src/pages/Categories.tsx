import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

// Type Definitions
interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('filter'); // <--- Reads URL
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Reset state when URL changes
  useEffect(() => {
    setIsLoading(true);
    setProducts([]);
    
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      fetchCategories();
    }
  }, [selectedCategory]);

  // MODE A: Fetch List of Categories
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const allProducts = querySnapshot.docs.map(doc => doc.data());

      const categoryMap = new Map<string, Category>();

      allProducts.forEach((product: any) => {
         const catName = product.category || 'Uncategorized';
         if (categoryMap.has(catName)) {
           categoryMap.get(catName)!.productCount += 1;
         } else {
           categoryMap.set(catName, {
             id: catName,
             name: catName,
             image: product.image,
             productCount: 1
           });
         }
      });
      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // MODE B: Fetch Products inside a Category
  const fetchProductsByCategory = async (categoryName: string) => {
    try {
      const q = query(
        collection(db, 'products'), 
        where('category', '==', categoryName)
      );
      const snapshot = await getDocs(q);
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {selectedCategory ? (
            <div className="flex items-center gap-4 self-start">
              <Button 
                variant="outline" 
                onClick={() => setSearchParams({})} // Clear URL to go back
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
              <h1 className="text-3xl font-bold text-stone-900">{selectedCategory}</h1>
            </div>
          ) : (
             <div className="text-center w-full">
                <h1 className="text-4xl font-bold text-stone-900 mb-2">Our Collections</h1>
                <p className="text-stone-500">Select a category to view products</p>
             </div>
          )}
        </div>

        {/* --- CONTENT SECTION --- */}
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="h-8 w-8 animate-spin text-bright-red-600" />
          </div>
        ) : selectedCategory ? (
          
          /* VIEW 1: PRODUCT GRID (When Category is clicked) */
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                       <Badge className="bg-white/90 text-stone-900 hover:bg-white shadow-sm">
                          {product.category}
                       </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold text-bright-red-700">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-stone-900 hover:bg-stone-800"
                        onClick={() => {
                          addToCart({ ...product, quantity: 1 });
                          toast.success("Added to cart");
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-stone-500">No products found in this category.</p>
              <Button variant="link" onClick={() => setSearchParams({})}>Go Back</Button>
            </div>
          )

        ) : (

          /* VIEW 2: CATEGORY LIST (Default View) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className="p-0 h-auto w-full hover:bg-transparent"
                onClick={() => setSearchParams({ filter: category.name })} // <--- Updates URL
              >
                <Card className="w-full overflow-hidden border-stone-200 hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90 text-sm font-medium">
                        {category.productCount} Items
                      </p>
                    </div>
                  </div>
                </Card>
              </Button>
            ))}
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
};

export default Categories;