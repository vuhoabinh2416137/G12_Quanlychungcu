import React, { useEffect, useMemo, useState } from 'react';
import { changeMyPassword, fetchMyProfile, updateMyProfile } from '../../api/usersApi.js';
import { isNonEmptyString, isValidEmail, isValidVietnamPhone } from '../../utils/validators.js';
import { useAuth } from '../../hooks/useAuth.js';

function validateProfileForm(form) {
  const errors = {};
  if (!isNonEmptyString(form.fullName)) errors.fullName = 'Vui lòng nhập họ và tên.';
  if (form.email && !isValidEmail(form.email)) errors.email = 'Email không đúng định dạng.';
  if (form.phone && !isValidVietnamPhone(form.phone)) errors.phone = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.';
  return errors;
}

function validatePasswordForm(form) {
  const errors = {};
  if (!isNonEmptyString(form.currentPassword)) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  if (!isNonEmptyString(form.newPassword)) errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  else if (form.newPassword.trim().length < 6) errors.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự.';
  if (!isNonEmptyString(form.confirmPassword)) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  else if (form.newPassword !== form.confirmPassword) errors.confirmPassword = 'Xác nhận mật khẩu chưa khớp.';
  return errors;
}

export default function ProfilePage() {
  const { auth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [profileTouched, setProfileTouched] = useState({});
  const [profileStatus, setProfileStatus] = useState({ submitting: false, error: '', success: '' });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordTouched, setPasswordTouched] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({ submitting: false, error: '', success: '' });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMyProfile();
        if (cancelled) return;
        setProfile(data);
        setProfileForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại.');
        else if (status === 403) setError('403 Forbidden: tài khoản không có quyền xem hồ sơ.');
        else setError('Không tải được thông tin hồ sơ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const profileErrors = useMemo(() => validateProfileForm(profileForm), [profileForm]);
  const canSubmitProfile = useMemo(() => Object.keys(profileErrors).length === 0, [profileErrors]);

  const passwordErrors = useMemo(() => validatePasswordForm(passwordForm), [passwordForm]);
  const canSubmitPassword = useMemo(() => Object.keys(passwordErrors).length === 0, [passwordErrors]);

  if (loading) return <div className="text-slate-600">Đang tải hồ sơ cá nhân...</div>;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin tài khoản và đổi mật khẩu đăng nhập.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-blue-400"></div>
          <div className="relative px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-3xl font-bold uppercase text-slate-600">
                  {profile?.fullName ? profile.fullName.charAt(0) : auth?.username?.charAt(0) || '?'}
                </div>
              </div>
              <span className="mb-2 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 ring-1 ring-inset ring-primary-600/20">
                {profile?.role || auth?.role || 'USER'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{profile?.fullName || '---'}</h2>
            <p className="mb-6 text-sm text-slate-500">@{profile?.username || auth?.username || 'unknown'}</p>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Tên đăng nhập</div>
                <div className="text-right text-sm font-semibold text-slate-900">{profile?.username || '---'}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Vai trò</div>
                <div className="text-right text-sm font-semibold text-slate-900">{profile?.role || '---'}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Trạng thái</div>
                <div className="text-right text-sm font-semibold text-slate-900">{profile?.active ? 'Đang hoạt động' : 'Đã khóa'}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Email</div>
                <div className="text-right text-sm font-semibold text-slate-900">{profile?.email || '---'}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Số điện thoại</div>
                <div className="text-right text-sm font-semibold text-slate-900">{profile?.phone || '---'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Cập nhật thông tin</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn có thể chỉnh sửa họ tên, email và số điện thoại.</p>

            {profileStatus.error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{profileStatus.error}</div>
            ) : null}
            {profileStatus.success ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">{profileStatus.success}</div>
            ) : null}

            <form
              className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setProfileTouched({ fullName: true, email: true, phone: true });

                if (!canSubmitProfile) {
                  setProfileStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.', success: '' });
                  return;
                }

                setProfileStatus({ submitting: true, error: '', success: '' });
                try {
                  const updated = await updateMyProfile({
                    fullName: profileForm.fullName.trim(),
                    email: profileForm.email.trim() || null,
                    phone: profileForm.phone.trim() || null,
                  });
                  setProfile(updated);
                  setProfileForm({
                    fullName: updated.fullName || '',
                    email: updated.email || '',
                    phone: updated.phone || '',
                  });
                  setProfileStatus({ submitting: false, error: '', success: 'Cập nhật hồ sơ thành công.' });
                } catch (err) {
                  const message = err?.response?.data?.message || 'Không cập nhật được hồ sơ.';
                  setProfileStatus({ submitting: false, error: message, success: '' });
                }
              }}
            >
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${profileTouched.fullName && profileErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  onBlur={() => setProfileTouched((prev) => ({ ...prev, fullName: true }))}
                />
                {profileTouched.fullName && profileErrors.fullName ? <div className="text-xs text-red-500">{profileErrors.fullName}</div> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${profileTouched.email && profileErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  onBlur={() => setProfileTouched((prev) => ({ ...prev, email: true }))}
                />
                {profileTouched.email && profileErrors.email ? <div className="text-xs text-red-500">{profileErrors.email}</div> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${profileTouched.phone && profileErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  onBlur={() => setProfileTouched((prev) => ({ ...prev, phone: true }))}
                />
                {profileTouched.phone && profileErrors.phone ? <div className="text-xs text-red-500">{profileErrors.phone}</div> : null}
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileStatus.submitting}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-70"
                >
                  {profileStatus.submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Đổi mật khẩu</h3>
            <p className="mt-1 text-sm text-slate-500">Đổi mật khẩu đăng nhập của bạn bằng cách nhập đúng mật khẩu hiện tại.</p>

            {passwordStatus.error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{passwordStatus.error}</div>
            ) : null}
            {passwordStatus.success ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">{passwordStatus.success}</div>
            ) : null}

            <form
              className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

                if (!canSubmitPassword) {
                  setPasswordStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.', success: '' });
                  return;
                }

                setPasswordStatus({ submitting: true, error: '', success: '' });
                try {
                  await changeMyPassword({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                  });
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordTouched({});
                  setPasswordStatus({ submitting: false, error: '', success: 'Đổi mật khẩu thành công.' });
                } catch (err) {
                  const message = err?.response?.data?.message || 'Không đổi được mật khẩu.';
                  setPasswordStatus({ submitting: false, error: message, success: '' });
                }
              }}
            >
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${passwordTouched.currentPassword && passwordErrors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, currentPassword: true }))}
                />
                {passwordTouched.currentPassword && passwordErrors.currentPassword ? <div className="text-xs text-red-500">{passwordErrors.currentPassword}</div> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mật khẩu mới <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${passwordTouched.newPassword && passwordErrors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, newPassword: true }))}
                />
                {passwordTouched.newPassword && passwordErrors.newPassword ? <div className="text-xs text-red-500">{passwordErrors.newPassword}</div> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${passwordTouched.confirmPassword && passwordErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }))}
                />
                {passwordTouched.confirmPassword && passwordErrors.confirmPassword ? <div className="text-xs text-red-500">{passwordErrors.confirmPassword}</div> : null}
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordStatus.submitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-70"
                >
                  {passwordStatus.submitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
