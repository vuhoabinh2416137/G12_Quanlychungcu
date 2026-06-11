import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Header() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="text-sm text-slate-600">
        Xin chào, <span className="font-semibold text-slate-900">{auth?.username}</span>{' '}
        <span className="text-slate-400">({auth?.role})</span>
      </div>

      <button
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        Đăng xuất
      </button>
    </header>
  );
}
