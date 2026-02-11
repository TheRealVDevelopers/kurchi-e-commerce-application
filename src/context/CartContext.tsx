import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApp } from './AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useApp();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Sync Cart with DB in real-time
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'cart'), (snap) => {
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
    });
    return () => unsub();
  }, [user]);

  const addToCart = async (item: CartItem) => {
    if (!user) {
        toast.error("Please login to add items");
        return;
    }
    
    const itemRef = doc(db, 'users', user.uid, 'cart', item.id);
    
    try {
        // If exists, increment; else set
        const existing = cartItems.find(i => i.id === item.id);
        
        if (existing) {
            await updateDoc(itemRef, { quantity: existing.quantity + 1 });
            toast.success(`Updated quantity for ${item.name}`);
        } else {
            // FIX: Explicitly create a new object with ONLY the fields we need.
            // This strips out any 'undefined' optional fields (like rating/badge) 
            // from the Product object that cause Firestore to crash.
            const newItem: CartItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity || 1
            };
            
            await setDoc(itemRef, newItem);
            toast.success(`${item.name} added to cart`);
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Could not add item. See console for details.");
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'cart', id));
        toast.success("Item removed");
    } catch (error) {
        console.error("Error removing item:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || quantity < 1) return;
    try {
        await updateDoc(doc(db, 'users', user.uid, 'cart', id), { quantity });
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
        const batch = writeBatch(db);
        const snap = await getDocs(collection(db, 'users', user.uid, 'cart'));
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        toast.success("Cart cleared");
    } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Failed to clear cart");
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};