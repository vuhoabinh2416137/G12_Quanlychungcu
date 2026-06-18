import React, { useEffect, useMemo, useState } from 'react';
import { createResident, deleteResident, fetchResidents, updateResident } from '../../api/residentsApi.js';
import { fetchApartments } from '../../api/apartmentsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  isDateInFuture,
  isNonEmptyString,
  isPositiveInteger,
  isValidEmail,
  isValidIdCard,
  isValidISODate,
  isValidVietnamPhone,
} from '../../utils/validators.js';

const GENDERS = ['Nam', 'Nữ', 'Khác'];
const RELATIONSHIPS = ['CHU_HO', 'VO_CHONG', 'CON_CAI', 'KHACH_THUE'];

function validateResident(form, existingResidents, { isEdit = false } = {}) {
  const errors = {};

  if (!isPositiveInteger(form.apartmentId)) errors.apartmentId = 'Apartment ID phải là số nguyên dương.';
  if (!isNonEmptyString(form.fullName)) errors.fullName = 'Họ tên là bắt buộc.';

  if (!isValidISODate(form.dateOfBirth)) errors.dateOfBirth = 'Ngày sinh phải đúng định dạng YYYY-MM-DD.';
  else if (isDateInFuture(form.dateOfBirth)) errors.dateOfBirth = 'Ngày sinh không hợp lệ (ở tương lai).';

  if (!GENDERS.includes(form.gender)) errors.gender = 'Giới tính không hợp lệ.';
  if (!isValidIdCard(form.idCard)) errors.idCard = 'CCCD/CMND phải là 9–12 chữ số.';
  if (!isValidVietnamPhone(form.phone)) errors.phone = 'SĐT phải gồm 10 chữ số, bắt đầu bằng 0.';
  if (!isValidEmail(form.email)) errors.email = 'Email không đúng định dạng.';
  if (!RELATIONSHIPS.includes(form.relationship)) errors.relationship = 'Quan hệ không hợp lệ.';

  const idCardNormalized = String(form.idCard || '').trim();
  if (idCardNormalized && !isEdit) {
    const existed = existingResidents.some((r) => String(r?.idCard || '').trim() === idCardNormalized);
    if (existed) errors.idCard = 'CCCD/CMND đã tồn tại.';
  }

  return errors;
}

function toResidentForm(resident) {
  return {
    apartmentId: resident?.apartmentId ?? '',
    fullName: resident?.fullName ?? '',
    dateOfBirth: resident?.dateOfBirth ?? '',
    gender: resident?.gender ?? 'Nam',
    idCard: resident?.idCard ?? '',
    phone: resident?.phone ?? '',
    email: resident?.email ?? '',
    relationship: resident?.relationship ?? 'CHU_HO',
  };
}

export default function ResidentsPage() {
  const { auth } = useAuth();
  const canWrite = auth?.role === 'ADMIN';

  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState({ submitting: false, error: '', success: '' });
  const [createTouched, setCreateTouched] = useState({});
  const [createForm, setCreateForm] = useState({
    apartmentId: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    idCard: '',
    phone: '',
    email: '',
    relationship: 'CHU_HO',
  });

  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState({ submitting: false, error: '' });
  const [editTouched, setEditTouched] = useState({});
  const [editForm, setEditForm] = useState({
    apartmentId: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    idCard: '',
    phone: '',
    email: '',
    relationship: 'CHU_HO',
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [resData, aptData] = await Promise.all([fetchResidents(), fetchApartments()]);
        if (!cancelled) {
          setResidents(resData);
          setApartments(aptData);
        }
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại (Basic Auth).');
        else if (status === 403) setError('403 Forbidden: tài khoản không đủ quyền xem cư dân (ADMIN/MANAGER).');
        else setError('Không tải được cư dân. Kiểm tra backend và baseURL.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const createErrors = useMemo(() => validateResident(createForm, residents, { isEdit: false }), [createForm, residents]);
  const canSubmitCreate = useMemo(() => Object.keys(createErrors).length === 0, [createErrors]);

  const editErrors = useMemo(() => validateResident(editForm, residents, { isEdit: true }), [editForm, residents]);
  const canSubmitEdit = useMemo(() => Object.keys(editErrors).length === 0, [editErrors]);

  const filtered = useMemo(() => {
    const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(query.trim());
    if (!q) return residents;
    return residents.filter((r) => {
      const fields = [
        r.fullName,
        r.phone,
        r.email,
        r.idCard,
        String(r.apartmentId),
        r.apartmentNumber,
      ];
      return fields.some((f) => normalize(f).includes(q));
    });
  }, [query, residents]);

  if (loading) return <div className="text-slate-600">Đang tải cư dân...</div>;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cư dân</h1>
          <p className="mt-1 text-sm text-slate-500">Xem, thêm, sửa, xóa danh sách cư dân trong chung cư.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 bg-surface pl-10 pr-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
              placeholder="Tìm theo tên, CCCD, căn hộ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {canWrite ? (
            <button
              className="relative inline-flex w-full sm:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95"
              onClick={() => {
                setCreateStatus({ submitting: false, error: '', success: '' });
                setCreateOpen((v) => !v);
              }}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm cư dân
            </button>
          ) : null}
        </div>
      </div>

      {createOpen && canWrite ? (
        <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Thêm cư dân mới</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Nhập thông tin chi tiết cho cư dân.
              </p>
            </div>
            <button
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              onClick={() => setCreateOpen(false)}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {createStatus.error ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{createStatus.error}</span>
              </div>
            ) : null}
            {createStatus.success ? (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600 flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{createStatus.success}</span>
              </div>
            ) : null}

            <form
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateTouched({
                  apartmentId: true,
                  fullName: true,
                  dateOfBirth: true,
                  gender: true,
                  idCard: true,
                  phone: true,
                  email: true,
                  relationship: true,
                });

                if (!canSubmitCreate) {
                  setCreateStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.', success: '' });
                  return;
                }

                setCreateStatus({ submitting: true, error: '', success: '' });
                try {
                  const apartmentId = Number(createForm.apartmentId);
                  const payload = {
                    fullName: createForm.fullName.trim(),
                    dateOfBirth: createForm.dateOfBirth.trim(),
                    gender: createForm.gender,
                    idCard: String(createForm.idCard).trim(),
                    phone: String(createForm.phone).trim(),
                    email: createForm.email.trim(),
                    relationship: createForm.relationship,
                  };

                  const created = await createResident(apartmentId, payload);
                  setResidents((prev) => [created, ...prev]);
                  setCreateStatus({ submitting: false, error: '', success: 'Tạo cư dân thành công.' });
                  setCreateForm({
                    apartmentId: '',
                    fullName: '',
                    dateOfBirth: '',
                    gender: 'Nam',
                    idCard: '',
                    phone: '',
                    email: '',
                    relationship: 'CHU_HO',
                  });
                  setCreateTouched({});
                } catch (err) {
                  const status = err?.response?.status;
                  if (status === 401 || status === 403) {
                    setCreateStatus({ submitting: false, error: 'Không có quyền (cần ADMIN).', success: '' });
                  } else {
                    setCreateStatus({ submitting: false, error: 'Không tạo được cư dân. Kiểm tra backend/log.', success: '' });
                  }
                }
              }}
            >
              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-slate-700">Căn hộ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:ring-4 ${createTouched.apartmentId && createErrors.apartmentId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={createForm.apartmentId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, apartmentId: e.target.value }))}
                    onBlur={() => setCreateTouched((t) => ({ ...t, apartmentId: true }))}
                  >
                    <option value="">-- Chọn căn hộ --</option>
                    {apartments.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.apartmentNumber}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {createTouched.apartmentId && createErrors.apartmentId ? (
                  <div className="text-xs text-red-500">{createErrors.apartmentId}</div>
                ) : null}
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Họ tên <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.fullName && createErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, fullName: true }))}
                  placeholder="VD: Nguyễn Văn A"
                />
                {createTouched.fullName && createErrors.fullName ? (
                  <div className="text-xs text-red-500">{createErrors.fullName}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ngày sinh <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.dateOfBirth && createErrors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.dateOfBirth}
                  onChange={(e) => setCreateForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, dateOfBirth: true }))}
                />
                {createTouched.dateOfBirth && createErrors.dateOfBirth ? (
                  <div className="text-xs text-red-500">{createErrors.dateOfBirth}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Giới tính <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={createForm.gender}
                    onChange={(e) => setCreateForm((f) => ({ ...f, gender: e.target.value }))}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {createTouched.gender && createErrors.gender ? (
                  <div className="text-xs text-red-500">{createErrors.gender}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">CCCD/CMND <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.idCard && createErrors.idCard ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.idCard}
                  onChange={(e) => setCreateForm((f) => ({ ...f, idCard: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, idCard: true }))}
                  placeholder="012345678901"
                  inputMode="numeric"
                />
                {createTouched.idCard && createErrors.idCard ? (
                  <div className="text-xs text-red-500">{createErrors.idCard}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.phone && createErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, phone: true }))}
                  placeholder="0905123456"
                  inputMode="tel"
                />
                {createTouched.phone && createErrors.phone ? (
                  <div className="text-xs text-red-500">{createErrors.phone}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.email && createErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, email: true }))}
                  placeholder="vana@example.com"
                  inputMode="email"
                />
                {createTouched.email && createErrors.email ? (
                  <div className="text-xs text-red-500">{createErrors.email}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Quan hệ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={createForm.relationship}
                    onChange={(e) => setCreateForm((f) => ({ ...f, relationship: e.target.value }))}
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r === 'CHU_HO' ? 'Chủ hộ' : r === 'VO_CHONG' ? 'Vợ/Chồng' : r === 'CON_CAI' ? 'Con cái' : 'Khách thuê'}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {createTouched.relationship && createErrors.relationship ? (
                  <div className="text-xs text-red-500">{createErrors.relationship}</div>
                ) : null}
              </div>

              <div className="md:col-span-2 lg:col-span-3 mt-2 flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  onClick={() => {
                    setCreateForm({
                      apartmentId: '',
                      fullName: '',
                      dateOfBirth: '',
                      gender: 'Nam',
                      idCard: '',
                      phone: '',
                      email: '',
                      relationship: 'CHU_HO',
                    });
                    setCreateTouched({});
                    setCreateStatus({ submitting: false, error: '', success: '' });
                  }}
                >
                  Xóa trắng
                </button>
                <button
                  type="submit"
                  disabled={createStatus.submitting}
                  className="relative inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
                >
                  {createStatus.submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo...
                    </>
                  ) : (
                    'Lưu cư dân'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Họ tên</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Căn hộ</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">SĐT</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Email</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Quan hệ</th>
                {canWrite ? <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Thao tác</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50/70 group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                        {r.fullName ? r.fullName.charAt(0) : '?'}
                      </div>
                      <span className="font-medium text-slate-900">{r.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      {r.apartmentNumber || r.apartmentId}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.phone}</td>
                  <td className="px-5 py-3 text-slate-600 truncate max-w-[150px]" title={r.email}>{r.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.relationship === 'CHU_HO' ? 'bg-primary-50 text-primary-700' : 
                      r.relationship === 'KHACH_THUE' ? 'bg-amber-50 text-amber-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {r.relationship === 'CHU_HO' ? 'Chủ hộ' : r.relationship === 'VO_CHONG' ? 'Vợ/Chồng' : r.relationship === 'CON_CAI' ? 'Con cái' : 'Khách thuê'}
                    </span>
                  </td>
                  {canWrite ? (
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Sửa"
                          onClick={() => {
                            setEditId(r.id);
                            setEditStatus({ submitting: false, error: '' });
                            setEditTouched({});
                            setEditForm(toResidentForm(r));
                          }}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Xóa"
                          onClick={async () => {
                            if (!window.confirm(`Bạn có chắc chắn muốn xóa cư dân: ${r.fullName}?`)) return;
                            try {
                              await deleteResident(r.id);
                              setResidents((prev) => prev.filter((x) => x.id !== r.id));
                            } catch (err) {
                              const status = err?.response?.status;
                              if (status === 401 || status === 403) alert('Không có quyền (cần ADMIN).');
                              else alert('Không xóa được. Kiểm tra backend/log.');
                            }
                          }}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={canWrite ? 6 : 5}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-10 w-10 text-slate-300 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <p className="text-sm font-medium text-slate-900">Không tìm thấy dữ liệu</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {editId && canWrite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-0 shadow-2xl">
            <div className="sticky top-0 z-10 bg-surface border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Sửa thông tin cư dân</h2>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                onClick={() => setEditId(null)}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {editStatus.error ? (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-600 flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{editStatus.error}</span>
                </div>
              ) : null}

              <form
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditTouched({
                    apartmentId: true,
                    fullName: true,
                    dateOfBirth: true,
                    gender: true,
                    idCard: true,
                    phone: true,
                    email: true,
                    relationship: true,
                  });

                  if (!canSubmitEdit) {
                    setEditStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.' });
                    return;
                  }

                  setEditStatus({ submitting: true, error: '' });
                  try {
                    const payload = {
                      fullName: editForm.fullName.trim(),
                      dateOfBirth: editForm.dateOfBirth.trim(),
                      gender: editForm.gender,
                      idCard: String(editForm.idCard).trim(),
                      phone: String(editForm.phone).trim(),
                      email: editForm.email.trim(),
                      relationship: editForm.relationship,
                    };

                    const updated = await updateResident(editId, payload);
                    setResidents((prev) => prev.map((x) => (x.id === editId ? updated : x)));
                    setEditId(null);
                  } catch (err) {
                    const status = err?.response?.status;
                    if (status === 401 || status === 403) setEditStatus({ submitting: false, error: 'Không có quyền (cần ADMIN).' });
                    else setEditStatus({ submitting: false, error: 'Không cập nhật được. Kiểm tra backend/log.' });
                  }
                }}
              >
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">ID Căn hộ</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
                    value={editForm.apartmentId}
                    disabled
                    readOnly
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Họ tên <span className="text-red-500">*</span></label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${editTouched.fullName && editErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                    onBlur={() => setEditTouched((t) => ({ ...t, fullName: true }))}
                  />
                  {editTouched.fullName && editErrors.fullName ? (
                    <div className="text-xs text-red-500">{editErrors.fullName}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Ngày sinh <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${editTouched.dateOfBirth && editErrors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                    onBlur={() => setEditTouched((t) => ({ ...t, dateOfBirth: true }))}
                  />
                  {editTouched.dateOfBirth && editErrors.dateOfBirth ? (
                    <div className="text-xs text-red-500">{editErrors.dateOfBirth}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Giới tính <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                      value={editForm.gender}
                      onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {editTouched.gender && editErrors.gender ? (
                    <div className="text-xs text-red-500">{editErrors.gender}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">CCCD/CMND</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
                    value={editForm.idCard}
                    disabled
                    readOnly
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${editTouched.phone && editErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    onBlur={() => setEditTouched((t) => ({ ...t, phone: true }))}
                  />
                  {editTouched.phone && editErrors.phone ? (
                    <div className="text-xs text-red-500">{editErrors.phone}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${editTouched.email && editErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    onBlur={() => setEditTouched((t) => ({ ...t, email: true }))}
                  />
                  {editTouched.email && editErrors.email ? (
                    <div className="text-xs text-red-500">{editErrors.email}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Quan hệ <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                      value={editForm.relationship}
                      onChange={(e) => setEditForm((f) => ({ ...f, relationship: e.target.value }))}
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r === 'CHU_HO' ? 'Chủ hộ' : r === 'VO_CHONG' ? 'Vợ/Chồng' : r === 'CON_CAI' ? 'Con cái' : 'Khách thuê'}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {editTouched.relationship && editErrors.relationship ? (
                    <div className="text-xs text-red-500">{editErrors.relationship}</div>
                  ) : null}
                </div>

                <div className="md:col-span-2 mt-4 flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    onClick={() => setEditId(null)}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={editStatus.submitting}
                    className="relative inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
                  >
                    {editStatus.submitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
