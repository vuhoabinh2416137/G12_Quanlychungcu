import { useRoutes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// Đây là nơi bạn định nghĩa các route cho ứng dụng
export default function AppRoutes() {
  const routes = useRoutes([
    { path: '/', element: <LoginPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/dashboard', element: <DashboardPage /> },
    // TODO: Thêm các route khác cho Quản lý cư dân, Phí, v.v.
  ]);

  return routes;
}