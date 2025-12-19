
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'superadmin' | 'user';

export interface User {
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface ProductRequest {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    adminName: string;
}

interface AppContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    productRequests: ProductRequest[];
    addProductRequest: (request: Omit<ProductRequest, 'id' | 'status' | 'requestedAt' | 'adminName'>) => void;
    updateRequestStatus: (id: number, status: 'approved' | 'rejected') => void;
    pendingRequestsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([
        {
            id: 1,
            name: 'Ergonomic Office Chair',
            category: 'office',
            price: 25999,
            description: 'Premium ergonomic office chair with lumbar support',
            image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop',
            status: 'pending',
            requestedAt: '2024-06-01T10:00:00Z',
            adminName: 'John Admin'
        },
        {
            id: 2,
            name: 'Luxury Sofa Set',
            category: 'sofas',
            price: 89999,
            description: 'Premium 3-seater sofa with premium fabric',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop',
            status: 'approved',
            requestedAt: '2024-05-30T14:30:00Z',
            adminName: 'Sarah Admin'
        }
    ]);

    const login = (role: UserRole) => {
        const newUser: User = {
            name: role === 'admin' ? 'John Admin' : 'Super Admin',
            role: role,
            avatar: 'https://github.com/shadcn.png'
        };
        setUser(newUser);
        toast.success(`Logged in as ${newUser.name}`);
    };

    const logout = () => {
        setUser(null);
        toast.info('Logged out successfully');
    };

    const addProductRequest = (requestData: Omit<ProductRequest, 'id' | 'status' | 'requestedAt' | 'adminName'>) => {
        const newRequest: ProductRequest = {
            id: Date.now(),
            ...requestData,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            adminName: user?.name || 'Unknown Admin'
        };
        setProductRequests([newRequest, ...productRequests]);
        toast.success('Product request submitted successfully');
    };

    const updateRequestStatus = (id: number, status: 'approved' | 'rejected') => {
        setProductRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status } : req
        ));
        toast.success(`Request ${status}`);
    };

    const pendingRequestsCount = productRequests.filter(req => req.status === 'pending').length;

    return (
        <AppContext.Provider value={{
            user,
            login,
            logout,
            productRequests,
            addProductRequest,
            updateRequestStatus,
            pendingRequestsCount
        }}>
            {children}
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
