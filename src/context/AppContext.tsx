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

// Updated Role & Status Types
export type UserRole = 'admin' | 'superadmin' | 'user' | 'business';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface User {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    status: UserStatus; // <--- ADDED STATUS
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

    // 1. Unified Auth & Profile Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                
                try {
                    // Fetch real-time profile updates (so if HQ approves them, they gain access instantly)
                    const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: data.name || firebaseUser.displayName || 'User',
                                role: data.role as UserRole,
                                status: (data.status as UserStatus) || 'active', // Default to active for customers
                                avatar: firebaseUser.photoURL || undefined,
                                gstNumber: data.gstNumber
                            });
                        } else {
                            // Document doesn't exist (handled by the Login application form logic)
                            setUser(null);
                        }
                        setLoading(false);
                    });

                    return () => unsubProfile();
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. Product Requests Listener (Only for Staff)
    useEffect(() => {
        if (!user || !['admin', 'superadmin'].includes(user.role) || user.status !== 'active') {
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
            // Silently fail if permissions aren't ready yet
            console.warn("Snapshot listener restricted by rules.");
        });

        return () => unsubscribe();
    }, [user]);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            toast.info('Logged out successfully');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const addProductRequest = async (requestData: Omit<ProductRequest, 'id' | 'status' | 'requestedAt' | 'adminName' | 'adminId'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'product_requests'), {
                ...requestData,
                status: 'pending',
                requestedAt: serverTimestamp(),
                adminName: user.name || user.email || 'Unknown',
                adminId: user.uid
            });
            toast.success('Product request submitted to HQ');
        } catch (error) {
            toast.error('Failed to submit request');
        }
    };

    const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, 'product_requests', id), { status });
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
            {/* We only show the app once the initial auth/profile check is done */}
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