import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApp } from './AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: string[]; // Array of Product IDs
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useApp();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
        setWishlist([]); 
        return;
    }
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'wishlist'), (snap) => {
        setWishlist(snap.docs.map(d => d.id));
    });
    return () => unsub();
  }, [user]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please login to save items");
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid, 'wishlist', productId), { addedAt: new Date() });
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add item");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const isInWishlist = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};