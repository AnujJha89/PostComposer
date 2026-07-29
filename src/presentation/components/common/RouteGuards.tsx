

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { selectIsAuthenticated, selectIsAdmin } from '../../../store/slices/authSlice';

interface Props { children: React.ReactNode; }

export function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/compose" replace />;
  }
  return <>{children}</>;
}
