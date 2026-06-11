import { NavLink } from 'react-router-dom';
import { getApiBaseUrl, isMockApi } from '../../api/apiBaseUrl.js';
import { useAuth } from '../../hooks/useAuth.js';

const linkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition';

const linkInactive = 'text-blue-100 hover:bg-blue-700/60 hover:text-white';
const linkActive = 'bg-white/15 text-white ring-1 ring-white/15';

function SidebarLink({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkInactive}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  const { auth } = useAuth();
  const apiBaseUrl = getApiBaseUrl();
  const mock = isMockApi(apiBaseUrl);
  const isResident = auth?.role === 'RESIDENT';

  return (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-800 to-blue-900">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-lg font-bold text-white">BlueMoon</div>
        <div className="text-xs text-blue-100/80">Quản lý chung cư</div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {!isResident ? (
          <SidebarLink to="/dashboard" end>
            Tổng quan
          </SidebarLink>
        ) : null}
        {!isResident ? <SidebarLink to="/residents">Cư dân</SidebarLink> : null}
        <SidebarLink to="/apartments">Căn hộ</SidebarLink>
        <SidebarLink to="/fees">Khoản phí</SidebarLink>
        <SidebarLink to="/notifications">Thông báo</SidebarLink>
        <SidebarLink to="/invoices">Hóa đơn</SidebarLink>
        {auth?.role === 'ADMIN' ? <SidebarLink to="/users">Quản lý tài khoản</SidebarLink> : null}
        {!isResident ? <SidebarLink to="/feedbacks">Ý kiến đóng góp</SidebarLink> : null}
        {!isResident ? <SidebarLink to="/profile">Tài khoản</SidebarLink> : null}
      </nav>

      <div className="border-t border-white/10 p-3 text-xs text-blue-100/70">
        API: <span className="font-mono">{apiBaseUrl}</span> ({mock ? 'mock' : 'backend'})
      </div>
    </aside>
  );
}
