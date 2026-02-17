import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, loading } = useApp();

    // 1. Still checking Firebase/Firestore? Show a spinner.
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-warm-600" />
            </div>
        );
    }

    // 2. Not logged in at all? Back to login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. IS A MANAGER BUT STATUS IS PENDING? 
    // We send them back to /login so the special "Pending Approval" screen we built can show.
    if (user.role === 'admin' && user.status === 'pending') {
        return <Navigate to="/login" replace />;
    }

    // 4. ROLE CHECK: Is the user's role allowed here?
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If a Customer (user/business) tries to enter a Staff area, 
        // we redirect them to /login so they see the "Staff Access Only" error screen.
        if (['user', 'business'].includes(user.role) && allowedRoles.some(r => ['admin', 'superadmin'].includes(r))) {
            return <Navigate to="/login" replace />;
        }

        // Standard role redirect fallback
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'superadmin') return <Navigate to="/super-admin" replace />;

        return <Navigate to="/" replace />;
    }

    // 5. Authorized and Active? Let them in!
    return <>{children}</>;
};

export default ProtectedRoute;