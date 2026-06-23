import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMockApi } from '../../api/apiBaseUrl.js';
import { loginWithJwt, registerUser, checkResidentForAuth } from '../../api/authApi.js';
import { getResidentByPhone } from '../../api/residentsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Modal from '../../components/common/Modal.jsx';
import { isNonEmptyString, isValidVietnamPhone } from '../../utils/validators.js';

const ROLES = ['ADMIN', 'CASHIER', 'RESIDENT'];

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  CASHIER: 'Thủ quỹ',
  RESIDENT: 'Cư dân',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  
  const [isRegister, setIsRegister] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regFullName, setRegFullName] = useState('');

  const [touched, setTouched] = useState({ username: false, password: false, phone: false, fullName: false });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fullName: '',
    pendingPayload: null,
  });

  const errors = useMemo(() => {
    const next = {};

    if (!isNonEmptyString(username)) next.username = 'Vui lòng nhập tên đăng nhập.';
    else if (username.trim().length < 3) next.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
    else if (/\s/.test(username)) next.username = 'Tên đăng nhập không được chứa khoảng trắng.';

    if (!isNonEmptyString(password)) next.password = 'Vui lòng nhập mật khẩu.';
    else if (password.trim().length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự.';

    if (isRegister) {
      if (!isNonEmptyString(regPhone)) next.phone = 'Vui lòng nhập số điện thoại.';
      else if (!isValidVietnamPhone(regPhone)) next.phone = 'Số điện thoại phải gồm 10 chữ số.';
      

    }

    return next;
  }, [password, username, isRegister, regPhone, regFullName]);

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
            setTouched({ username: true, password: true, phone: true, fullName: true });

            if (!canSubmit) {
              setFormError('Vui lòng kiểm tra lại thông tin.');
              return;
            }

            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();

            setSubmitting(true);
            try {
              if (isRegister) {
                try {
                   // Sử dụng endpoint public /auth/check-resident để kiểm tra
                   const resData = await checkResidentForAuth(regPhone.trim());
                   if (resData.hasAccount) {
                       throw new Error('Tài khoản đã tồn tại, vui lòng đăng nhập.');
                   }
                   
                   // Nếu hệ thống trả về thông tin (fullName) và hasAccount = false
                   // Hỏi người dùng xác nhận
                   setConfirmModal({
                     isOpen: true,
                     fullName: resData.fullName,
                     pendingPayload: {
                       username: trimmedUsername,
                       password: trimmedPassword,
                       role: 'RESIDENT',
                       fullName: resData.fullName,
                       phone: regPhone.trim(),
                     }
                   });
                   setSubmitting(false);
                   return;

                } catch(err) {
                   const msg = err?.response?.data?.message || err.message || 'Lỗi kiểm tra cư dân.';
                   throw new Error(msg);
                }
              } else {
                if (isMockApi()) {
                  login({
                    token: 'mock-token',
                    role: 'ADMIN',
                    username: trimmedUsername,
                    fullName: trimmedUsername,
                  });
                  navigate('/dashboard', { replace: true });
                } else {
                  const response = await loginWithJwt({
                    username: trimmedUsername,
                    password: trimmedPassword,
                  });
                  login(response);
                  navigate(response.role === 'RESIDENT' ? '/apartments' : '/dashboard', { replace: true });
                }
              }
            } catch (err) {
              const msg = err?.response?.data?.message || err.message || 'Có lỗi xảy ra.';
              if (msg.includes('Bad credentials')) {
                setFormError('Tên đăng nhập hoặc mật khẩu không chính xác');
              } else {
                setFormError(msg);
              }
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

          {isRegister && (
            <>
              <div className="space-y-1.5 animate-fade-in-up">
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <input
                    className={`w-full rounded-xl border py-3 px-4 text-sm outline-none transition-all focus:ring-4 ${touched.phone && errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    placeholder="0912345678"
                  />
                </div>
                {touched.phone && errors.phone ? <div className="text-xs text-red-500">{errors.phone}</div> : null}
              </div>
            </>
          )}


          <button
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
            type="submit"
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Đang xử lý...' : isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}
          </button>
          
          <div className="text-center text-sm text-slate-500">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button
              type="button"
              className="ml-1 text-primary-600 hover:text-primary-700 hover:underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setFormError('');
                setTouched({ username: false, password: false, phone: false, fullName: false });
              }}
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </div>
        </form>


      </div>

      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => {
          setConfirmModal({ isOpen: false, fullName: '', pendingPayload: null });
        }} 
        title="Xác nhận tạo tài khoản"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100">
            <p className="text-sm text-indigo-900">
              Hệ thống tìm thấy tên bạn là: <span className="font-bold text-indigo-700">{confirmModal.fullName}</span>. Bạn có muốn tạo tài khoản không?
            </p>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => {
                setConfirmModal({ isOpen: false, fullName: '', pendingPayload: null });
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-70"
              onClick={async () => {
                setSubmitting(true);
                setFormError('');
                try {
                  await registerUser(confirmModal.pendingPayload);
                  
                  const response = await loginWithJwt({
                    username: confirmModal.pendingPayload.username,
                    password: confirmModal.pendingPayload.password,
                  });
                  login(response);
                  navigate('/apartments', { replace: true });
                } catch (err) {
                  const msg = err?.response?.data?.message || err.message || 'Lỗi tạo tài khoản.';
                  setFormError(msg);
                } finally {
                  setSubmitting(false);
                  setConfirmModal({ isOpen: false, fullName: '', pendingPayload: null });
                }
              }}
            >
              {submitting ? 'Đang tạo...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
