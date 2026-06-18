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
import PaymentHistoryPage from '../pages/payments/PaymentHistoryPage.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';
import FeedbackPage from '../pages/feedback/FeedbackPage.jsx';
import UsersPage from '../pages/users/UsersPage.jsx';
import CashierDashboard from '../pages/cashier/CashierDashboard.jsx';

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

function CashierOnlyRoute({ children }) {
  const { auth } = useAuth();
  if (auth?.role !== 'ADMIN' && auth?.role !== 'CASHIER') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ExcludeCashierRoute({ children }) {
  const { auth } = useAuth();
  if (auth?.role === 'CASHIER') {
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
                <ExcludeCashierRoute>
                  <ResidentRestrictedRoute>
                    <ResidentsPage />
                  </ResidentRestrictedRoute>
                </ExcludeCashierRoute>
              ),
            },
            {
              path: '/apartments',
              element: (
                <ExcludeCashierRoute>
                  <ApartmentsPage />
                </ExcludeCashierRoute>
              ),
            },
            { path: '/fees', element: <FeesPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/payment-history', element: <PaymentHistoryPage /> },
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
                <ExcludeCashierRoute>
                  <FeedbackPage />
                </ExcludeCashierRoute>
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
            {
              path: '/cashier',
              element: (
                <CashierOnlyRoute>
                  <CashierDashboard />
                </CashierOnlyRoute>
              ),
            },
          ],
        },
      ],
    },
    { path: '*', element: <HomeRedirect /> },
  ]);
}
