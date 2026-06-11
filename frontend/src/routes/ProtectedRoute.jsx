import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { isMockApi } from '../api/apiBaseUrl.js';

export default function ProtectedRoute() {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;
  if (!isMockApi() && !auth.token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
