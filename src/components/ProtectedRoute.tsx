import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    staffRoute?: boolean; // Determines which login page to redirect to
}

const ProtectedRoute = ({ children, allowedRoles, staffRoute = false }: ProtectedRouteProps) => {
    const { user, loading } = useApp();
    const loginPath = staffRoute ? '/staff/login' : '/login';

    // 1. Still checking Firebase/Firestore? Show a spinner.
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-warm-600" />
            </div>
        );
    }

    // 2. Not logged in at all? Redirect to appropriate login.
    if (!user) {
        return <Navigate to={loginPath} replace />;
    }

    // 3. IS A MANAGER BUT STATUS IS PENDING?
    if (user.role === 'admin' && user.status === 'pending') {
        return <Navigate to="/staff/login" replace />;
    }

    // 4. ROLE CHECK: Is the user's role allowed here?
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Customer trying to enter Staff area → send to customer login
        if (['user', 'business'].includes(user.role) && allowedRoles.some(r => ['admin', 'superadmin'].includes(r))) {
            return <Navigate to="/" replace />;
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