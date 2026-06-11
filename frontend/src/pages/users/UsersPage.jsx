import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { createUser, fetchUsers, updateUserActive, updateUserRole } from '../../api/usersApi.js';
import { isNonEmptyString, isValidEmail, isValidVietnamPhone } from '../../utils/validators.js';

const ROLES = ['ADMIN', 'MANAGER', 'RESIDENT'];

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  RESIDENT: 'Cư dân',
};

function validateCreateForm(form) {
  const errors = {};

  if (!isNonEmptyString(form.username)) errors.username = 'Vui lòng nhập tên đăng nhập.';
  else if (form.username.trim().length < 3) errors.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
  else if (/\s/.test(form.username)) errors.username = 'Tên đăng nhập không được chứa khoảng trắng.';

  if (!isNonEmptyString(form.password)) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (form.password.trim().length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.';

  if (!ROLES.includes(form.role)) errors.role = 'Vai trò không hợp lệ.';
  if (!isNonEmptyString(form.fullName)) errors.fullName = 'Vui lòng nhập họ và tên.';
  if (form.email && !isValidEmail(form.email)) errors.email = 'Email không đúng định dạng.';
  if (form.phone && !isValidVietnamPhone(form.phone)) errors.phone = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.';

  return errors;
}

function formatDateTime(value) {
  if (!value) return '---';
  return new Date(value).toLocaleString('vi-VN');
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    role: 'MANAGER',
    fullName: '',
    email: '',
    phone: '',
  });
  const [createTouched, setCreateTouched] = useState({});
  const [createStatus, setCreateStatus] = useState({ submitting: false, error: '', success: '' });

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại.');
        else if (status === 403) setError('403 Forbidden: chỉ ADMIN được quản lý tài khoản.');
        else setError('Không tải được danh sách tài khoản.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const createErrors = useMemo(() => validateCreateForm(createForm), [createForm]);
  const canSubmitCreate = useMemo(() => Object.keys(createErrors).length === 0, [createErrors]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const fields = [user.username, user.fullName, user.email, user.phone, user.role];
      return fields.some((field) => String(field || '').toLowerCase().includes(q));
    });
  }, [query, users]);

  async function handleRoleChange(userId, role) {
    setActionLoading((prev) => ({ ...prev, [`role-${userId}`]: true }));
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
    } catch (err) {
      const message = err?.response?.data?.message || 'Không cập nhật được vai trò.';
      window.alert(message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`role-${userId}`]: false }));
    }
  }

  async function handleActiveToggle(user) {
    const nextActive = !user.active;
    setActionLoading((prev) => ({ ...prev, [`active-${user.id}`]: true }));
    try {
      const updated = await updateUserActive(user.id, nextActive);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
    } catch (err) {
      const message = err?.response?.data?.message || 'Không cập nhật được trạng thái tài khoản.';
      window.alert(message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`active-${user.id}`]: false }));
    }
  }

  if (loading) return <div className="text-slate-600">Đang tải danh sách tài khoản...</div>;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo tài khoản mới, đổi vai trò và khóa hoặc mở người dùng trong hệ thống.</p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 sm:w-72"
            placeholder="Tìm theo tên, username, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => {
              setCreateStatus({ submitting: false, error: '', success: '' });
              setCreateOpen(true);
            }}
          >
            Tạo tài khoản
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">Tài khoản</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">Vai trò</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">Liên hệ</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">Trạng thái</th>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">Ngày tạo</th>
                <th className="px-5 py-4 text-right font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const roleBusy = Boolean(actionLoading[`role-${user.id}`]);
                const activeBusy = Boolean(actionLoading[`active-${user.id}`]);

                return (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{user.fullName}</div>
                      <div className="text-xs text-slate-500">{user.username}</div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                        value={user.role}
                        disabled={roleBusy}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div>{user.email || '---'}</div>
                      <div className="text-xs">{user.phone || '---'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {user.active ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Đang hoạt động</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Đã khóa</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(user.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          user.active
                            ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'
                        }`}
                        disabled={activeBusy}
                        onClick={() => handleActiveToggle(user)}
                      >
                        {activeBusy ? 'Đang xử lý...' : user.active ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                    Không có tài khoản nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo tài khoản mới">
        {createStatus.error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{createStatus.error}</div>
        ) : null}
        {createStatus.success ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">{createStatus.success}</div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setCreateTouched({
              username: true,
              password: true,
              role: true,
              fullName: true,
              email: true,
              phone: true,
            });

            if (!canSubmitCreate) {
              setCreateStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.', success: '' });
              return;
            }

            setCreateStatus({ submitting: true, error: '', success: '' });
            try {
              const created = await createUser({
                username: createForm.username.trim(),
                password: createForm.password.trim(),
                role: createForm.role,
                fullName: createForm.fullName.trim(),
                email: createForm.email.trim() || null,
                phone: createForm.phone.trim() || null,
              });
              setUsers((prev) => [created, ...prev]);
              setCreateStatus({ submitting: false, error: '', success: 'Tạo tài khoản thành công.' });
              setCreateForm({
                username: '',
                password: '',
                role: 'MANAGER',
                fullName: '',
                email: '',
                phone: '',
              });
              setCreateTouched({});
            } catch (err) {
              const message = err?.response?.data?.message || 'Không tạo được tài khoản.';
              setCreateStatus({ submitting: false, error: message, success: '' });
            }
          }}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tên đăng nhập <span className="text-red-500">*</span></label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.username && createErrors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
              value={createForm.username}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
              onBlur={() => setCreateTouched((prev) => ({ ...prev, username: true }))}
            />
            {createTouched.username && createErrors.username ? <div className="text-xs text-red-500">{createErrors.username}</div> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mật khẩu <span className="text-red-500">*</span></label>
            <input
              type="password"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.password && createErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              onBlur={() => setCreateTouched((prev) => ({ ...prev, password: true }))}
            />
            {createTouched.password && createErrors.password ? <div className="text-xs text-red-500">{createErrors.password}</div> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Vai trò <span className="text-red-500">*</span></label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.fullName && createErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
              value={createForm.fullName}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
              onBlur={() => setCreateTouched((prev) => ({ ...prev, fullName: true }))}
            />
            {createTouched.fullName && createErrors.fullName ? <div className="text-xs text-red-500">{createErrors.fullName}</div> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.email && createErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              onBlur={() => setCreateTouched((prev) => ({ ...prev, email: true }))}
            />
            {createTouched.email && createErrors.email ? <div className="text-xs text-red-500">{createErrors.email}</div> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.phone && createErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
              value={createForm.phone}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              onBlur={() => setCreateTouched((prev) => ({ ...prev, phone: true }))}
            />
            {createTouched.phone && createErrors.phone ? <div className="text-xs text-red-500">{createErrors.phone}</div> : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => setCreateOpen(false)}
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={createStatus.submitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-70"
            >
              {createStatus.submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
