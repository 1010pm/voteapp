/**
 * Admin Route Component
 * 
 * Wraps routes that require admin role
 * Redirects to dashboard if user is not admin
 */

import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { ROUTES, ROLES } from '../../utils/constants';

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default AdminRoute;
