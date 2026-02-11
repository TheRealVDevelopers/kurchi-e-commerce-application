import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApp } from './AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc, writeBatch, query, getDocs } from 'firebase/firestore';
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
    if (!user) return toast.error("Please login to add items");
    const itemRef = doc(db, 'users', user.uid, 'cart', item.id);
    
    // If exists, increment; else set
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      await updateDoc(itemRef, { quantity: existing.quantity + 1 });
    } else {
      await setDoc(itemRef, { ...item });
    }
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cart', id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || quantity < 1) return;
    await updateDoc(doc(db, 'users', user.uid, 'cart', id), { quantity });
  };

  const clearCart = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const snap = await getDocs(collection(db, 'users', user.uid, 'cart'));
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
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