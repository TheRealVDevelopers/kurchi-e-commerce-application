import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Add 'business' to the UserRole type definition
export type UserRole = 'admin' | 'superadmin' | 'user' | 'business';

export interface User {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    avatar?: string;
    gstNumber?: string;
}

export interface ProductRequest {
    id: string; 
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: any;
    adminName: string;
    adminId: string;
}

interface AppContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    productRequests: ProductRequest[];
    addProductRequest: (request: Omit<ProductRequest, 'id' | 'status' | 'requestedAt' | 'adminName' | 'adminId'>) => Promise<void>;
    updateRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
    pendingRequestsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);

    // 1. Listen for Authentication Changes (THE MISSING PIECE)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch the user's role from a 'users' collection in Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                
                try {
                    const userSnapshot = await getDoc(userDocRef);
                    let role: UserRole = 'user';
                    let gstNumber: string | undefined;

                    if (userSnapshot.exists()) {
                        const data = userSnapshot.data();
                        role = data.role as UserRole;
                        gstNumber = data.gstNumber;
                    } else {
                        // Create basic profile if it doesn't exist
                        await setDoc(userDocRef, {
                            email: firebaseUser.email,
                            role: 'user',
                            createdAt: serverTimestamp()
                        });
                    }

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || 'User',
                        role: role,
                        avatar: firebaseUser.photoURL || undefined,
                        gstNumber
                    });
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Listen for Real-time Data (Product Requests)
    useEffect(() => {
        if (!user) {
            setProductRequests([]);
            return;
        }

        const q = query(collection(db, 'product_requests'), orderBy('requestedAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ProductRequest[];
            
            setProductRequests(requests);
        }, (error) => {
            console.error("Error fetching requests:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const logout = async () => {
        try {
            await signOut(auth);
            toast.info('Logged out successfully');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const addProductRequest = async (requestData: Omit<ProductRequest, 'id' | 'status' | 'requestedAt' | 'adminName' | 'adminId'>) => {
        if (!user) {
            toast.error("You must be logged in");
            return;
        }

        try {
            await addDoc(collection(db, 'product_requests'), {
                ...requestData,
                status: 'pending',
                requestedAt: serverTimestamp(),
                adminName: user.name || user.email || 'Unknown',
                adminId: user.uid
            });
            toast.success('Product request submitted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit request');
        }
    };

    const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const requestRef = doc(db, 'product_requests', id);
            await updateDoc(requestRef, { status });
            toast.success(`Request ${status}`);
        } catch (error) {
            toast.error(`Failed to update status`);
        }
    };

    const pendingRequestsCount = productRequests.filter(req => req.status === 'pending').length;

    return (
        <AppContext.Provider value={{
            user,
            loading,
            logout,
            productRequests,
            addProductRequest,
            updateRequestStatus,
            pendingRequestsCount
        }}>
            {!loading && children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};