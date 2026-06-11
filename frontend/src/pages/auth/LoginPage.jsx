import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMockApi } from '../../api/apiBaseUrl.js';
import { loginWithJwt } from '../../api/authApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isNonEmptyString } from '../../utils/validators.js';

const ROLES = ['ADMIN', 'MANAGER', 'RESIDENT'];

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  RESIDENT: 'Cư dân',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('ADMIN');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next = {};

    if (!isNonEmptyString(username)) next.username = 'Vui lòng nhập tên đăng nhập.';
    else if (username.trim().length < 3) next.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
    else if (/\s/.test(username)) next.username = 'Tên đăng nhập không được chứa khoảng trắng.';

    if (!isNonEmptyString(password)) next.password = 'Vui lòng nhập mật khẩu.';
    else if (password.trim().length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự.';

    return next;
  }, [password, username]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-md animate-fade-in-up rounded-3xl border border-slate-100 bg-surface p-10 shadow-floating">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/30">
            <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">BlueMoon</h2>
          <p className="mt-2 text-sm text-slate-500">Hệ thống quản lý chung cư cao cấp</p>
        </div>

        {formError ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <svg className="h-5 w-5 shrink-0 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{formError}</span>
          </div>
        ) : null}

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError('');
            setTouched({ username: true, password: true });

            if (!canSubmit) {
              setFormError('Vui lòng kiểm tra lại thông tin đăng nhập.');
              return;
            }

            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();

            setSubmitting(true);
            try {
              if (isMockApi()) {
                login({
                  token: 'mock-token',
                  role,
                  username: trimmedUsername,
                  fullName: trimmedUsername,
                });
                navigate(role === 'RESIDENT' ? '/apartments' : '/dashboard', { replace: true });
              } else {
                const response = await loginWithJwt({
                  username: trimmedUsername,
                  password: trimmedPassword,
                  role,
                });
                login(response);
                navigate(response.role === 'RESIDENT' ? '/apartments' : '/dashboard', { replace: true });
              }
            } catch (err) {
              setFormError(err?.response?.data?.message || 'Sai thông tin đăng nhập, sai vai trò hoặc backend chưa chạy.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-4 ${touched.username && errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            {touched.username && errors.username ? <div className="text-xs text-red-500">{errors.username}</div> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-4 ${touched.password && errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                type="password"
                placeholder="••••••••"
              />
            </div>
            {touched.password && errors.password ? <div className="text-xs text-red-500">{errors.password}</div> : null}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium text-slate-700">
              Vai trò đăng nhập {isMockApi() ? '(Demo)' : ''}
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
            type="submit"
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Đang xử lý...' : 'Đăng nhập hệ thống'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          Kết nối API:{' '}
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-600">
            {isMockApi() ? 'http://localhost:3001' : 'http://localhost:8080/api'}
          </span>
        </div>
      </div>
    </div>
  );
}
