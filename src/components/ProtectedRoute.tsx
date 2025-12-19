
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user } = useApp();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Optionally redirect to a "Not Authorized" page or dashboard
        // For now, if admin tries to access super-admin, redirect back to admin
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'superadmin') return <Navigate to="/super-admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
