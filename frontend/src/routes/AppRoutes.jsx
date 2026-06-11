import { Navigate, useRoutes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import ResidentsPage from '../pages/residents/ResidentsPage.jsx';
import ApartmentsPage from '../pages/residents/ApartmentsPage.jsx';
import FeesPage from '../pages/fees/FeesPage.jsx';
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx';
import InvoicesPage from '../pages/invoices/InvoicesPage.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';
import FeedbackPage from '../pages/feedback/FeedbackPage.jsx';
import UsersPage from '../pages/users/UsersPage.jsx';

function HomeRedirect() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <Navigate to={auth.role === 'RESIDENT' ? '/apartments' : '/dashboard'} replace />;
}

function ResidentRestrictedRoute({ children }) {
  const { auth } = useAuth();
  if (auth?.role === 'RESIDENT') {
    return <Navigate to="/apartments" replace />;
  }
  return children;
}

function AdminOnlyRoute({ children }) {
  const { auth } = useAuth();
  if (auth?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return useRoutes([
    { path: '/', element: <HomeRedirect /> },
    { path: '/login', element: <LoginPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              path: '/dashboard',
              element: (
                <ResidentRestrictedRoute>
                  <DashboardPage />
                </ResidentRestrictedRoute>
              ),
            },
            {
              path: '/residents',
              element: (
                <ResidentRestrictedRoute>
                  <ResidentsPage />
                </ResidentRestrictedRoute>
              ),
            },
            { path: '/apartments', element: <ApartmentsPage /> },
            { path: '/fees', element: <FeesPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/invoices', element: <InvoicesPage /> },
            {
              path: '/users',
              element: (
                <AdminOnlyRoute>
                  <UsersPage />
                </AdminOnlyRoute>
              ),
            },
            {
              path: '/feedbacks',
              element: (
                <ResidentRestrictedRoute>
                  <FeedbackPage />
                </ResidentRestrictedRoute>
              ),
            },
            {
              path: '/profile',
              element: (
                <ResidentRestrictedRoute>
                  <ProfilePage />
                </ResidentRestrictedRoute>
              ),
            },
          ],
        },
      ],
    },
    { path: '*', element: <HomeRedirect /> },
  ]);
}
