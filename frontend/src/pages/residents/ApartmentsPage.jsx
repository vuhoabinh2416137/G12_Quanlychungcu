import React, { useEffect, useMemo, useState } from 'react';
import {
  createApartment,
  deleteApartment,
  fetchApartments,
  updateApartment,
} from '../../api/apartmentsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isNonEmptyString } from '../../utils/validators.js';
import ApartmentDetailModal from './ApartmentDetailModal.jsx';
import VehicleListModal from './VehicleListModal.jsx';

const STATUSES = ['VACANT', 'OCCUPIED'];

function validateApartment(form) {
  const errors = {};
  if (!isNonEmptyString(form.apartmentNumber)) errors.apartmentNumber = 'Mã căn hộ là bắt buộc.';
  if (!isNonEmptyString(form.status) || !STATUSES.includes(form.status))
    errors.status = 'Trạng thái không hợp lệ.';
  if (form.area !== '' && Number.isNaN(Number(form.area))) errors.area = 'Diện tích phải là số.';
  return errors;
}

export default function ApartmentsPage() {
  const { auth } = useAuth();
  const canWrite = auth?.role === 'ADMIN';

  const [apartments, setApartments] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailApartment, setDetailApartment] = useState(null);
  const [vehicleModalApartment, setVehicleModalApartment] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createTouched, setCreateTouched] = useState({});
  const [createStatus, setCreateStatus] = useState({ submitting: false, error: '', success: '' });
  const [createForm, setCreateForm] = useState({
    apartmentNumber: '',
    building: '',
    floor: '',
    area: '',
    status: 'VACANT',
    motorbikeCount: '',
    carCount: '',
  });

  const [editId, setEditId] = useState(null);
  const [editTouched, setEditTouched] = useState({});
  const [editStatus, setEditStatus] = useState({ submitting: false, error: '' });
  const [editForm, setEditForm] = useState({
    apartmentNumber: '',
    building: '',
    floor: '',
    area: '',
    status: 'VACANT',
    motorbikeCount: '',
    carCount: '',
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchApartments();
        if (!cancelled) setApartments(data);
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại (Basic Auth).');
        else setError('Không tải được căn hộ. Kiểm tra backend và baseURL.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(query.trim());
    if (!q) return apartments;
    return apartments.filter((a) => {
      const statusText = a.status === 'VACANT' ? 'trống' : 'đang ở';
      const fields = [a.apartmentNumber, a.floor, statusText];
      return fields.some((f) => normalize(f).includes(q));
    });
  }, [apartments, query]);

  const createErrors = useMemo(() => validateApartment(createForm), [createForm]);
  const canSubmitCreate = useMemo(() => Object.keys(createErrors).length === 0, [createErrors]);

  const editErrors = useMemo(() => validateApartment(editForm), [editForm]);
  const canSubmitEdit = useMemo(() => Object.keys(editErrors).length === 0, [editErrors]);

  if (loading) return <div className="text-slate-600">Đang tải căn hộ...</div>;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Căn hộ</h1>
          <p className="mt-1 text-sm text-slate-500">Xem, thêm, sửa, xóa danh sách các căn hộ trong chung cư.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 bg-surface pl-10 pr-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
              placeholder="Tìm theo mã căn, trạng thái..."
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
              Thêm căn hộ
            </button>
          ) : null}
        </div>
      </div>

      {createOpen && canWrite ? (
        <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden animate-fade-in-up">
           <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Thêm căn hộ mới</h2>
              <p className="mt-0.5 text-sm text-slate-500">Điền thông tin chi tiết cho căn hộ.</p>
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
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateTouched({
                  apartmentNumber: true,
                  building: true,
                  floor: true,
                  area: true,
                  status: true,
                });

                if (!canSubmitCreate) {
                  setCreateStatus({
                    submitting: false,
                    error: 'Vui lòng kiểm tra lại các trường bị lỗi.',
                    success: '',
                  });
                  return;
                }

                setCreateStatus({ submitting: true, error: '', success: '' });
                try {
                  const payload = {
                    apartmentNumber: createForm.apartmentNumber.trim(),
                    building: createForm.building.trim() || null,
                    floor: createForm.floor.trim() || null,
                    area: createForm.area === '' ? null : Number(createForm.area),
                    status: createForm.status,
                    motorbikeCount: createForm.motorbikeCount === '' ? 0 : Number(createForm.motorbikeCount),
                    carCount: createForm.carCount === '' ? 0 : Number(createForm.carCount),
                  };

                  const created = await createApartment(payload);
                  setApartments((prev) => [created, ...prev]);
                  setCreateStatus({ submitting: false, error: '', success: 'Tạo căn hộ thành công.' });
                  setCreateForm({ apartmentNumber: '', building: '', floor: '', area: '', status: 'VACANT', motorbikeCount: '', carCount: '' });
                  setCreateTouched({});
                } catch (err) {
                  const status = err?.response?.status;
                  if (status === 401 || status === 403) {
                    setCreateStatus({ submitting: false, error: 'Không có quyền (cần ADMIN).', success: '' });
                  } else {
                    setCreateStatus({
                      submitting: false,
                      error: 'Không tạo được căn hộ. Kiểm tra backend/log.',
                      success: '',
                    });
                  }
                }
              }}
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mã căn hộ <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.apartmentNumber && createErrors.apartmentNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.apartmentNumber}
                  onChange={(e) => setCreateForm((f) => ({ ...f, apartmentNumber: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, apartmentNumber: true }))}
                  placeholder="VD: A101"
                />
                {createTouched.apartmentNumber && createErrors.apartmentNumber ? (
                  <div className="text-xs text-red-500">{createErrors.apartmentNumber}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Trạng thái <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={createForm.status}
                    onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                    onBlur={() => setCreateTouched((t) => ({ ...t, status: true }))}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'VACANT' ? 'Trống' : 'Đang ở'} ({s})
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {createTouched.status && createErrors.status ? (
                  <div className="text-xs text-red-500">{createErrors.status}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tòa</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  value={createForm.building}
                  onChange={(e) => setCreateForm((f) => ({ ...f, building: e.target.value }))}
                  placeholder="VD: Tòa A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tầng</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  value={createForm.floor}
                  onChange={(e) => setCreateForm((f) => ({ ...f, floor: e.target.value }))}
                  placeholder="VD: 10"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-slate-700">Diện tích (m²)</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.area && createErrors.area ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.area}
                  onChange={(e) => setCreateForm((f) => ({ ...f, area: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, area: true }))}
                  placeholder="VD: 75.5"
                  inputMode="decimal"
                />
                {createTouched.area && createErrors.area ? (
                  <div className="text-xs text-red-500">{createErrors.area}</div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số xe máy</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  value={createForm.motorbikeCount}
                  onChange={(e) => setCreateForm((f) => ({ ...f, motorbikeCount: e.target.value }))}
                  placeholder="VD: 2"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số ô tô</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  value={createForm.carCount}
                  onChange={(e) => setCreateForm((f) => ({ ...f, carCount: e.target.value }))}
                  placeholder="VD: 1"
                  inputMode="numeric"
                />
              </div>

              <div className="md:col-span-2 mt-2 flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  onClick={() => {
                    setCreateForm({ apartmentNumber: '', building: '', floor: '', area: '', status: 'VACANT', motorbikeCount: '', carCount: '' });
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
                    'Lưu căn hộ'
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
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Mã căn hộ</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Tòa</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Tầng</th>
                <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Diện tích</th>
                <th className="px-5 py-3.5 text-center font-semibold text-slate-600">Xe máy</th>
                <th className="px-5 py-3.5 text-center font-semibold text-slate-600">Ô tô</th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Trạng thái</th>
                <th className="px-5 py-3.5 text-center font-semibold text-slate-600">⚡ Điện (kWh)</th>
                <th className="px-5 py-3.5 text-center font-semibold text-slate-600">💧 Nước (m³)</th>
                {canWrite ? <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Thao tác</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50/70 group">
                  <td className="px-5 py-3 font-medium text-slate-900">{a.apartmentNumber}</td>
                  <td className="px-5 py-3 text-slate-600">{a.building || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{a.floor || '-'}</td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {a.area == null ? '-' : `${Number(a.area).toLocaleString('vi-VN')} m²`}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 font-medium">
                    {a.motorbikeCount > 0 ? (
                      <button
                        onClick={() => setVehicleModalApartment(a)}
                        className="inline-flex items-center justify-center min-w-[2rem] rounded bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:underline cursor-pointer"
                        title="Xem chi tiết xe"
                      >
                        {a.motorbikeCount}
                      </button>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 font-medium">
                    {a.carCount > 0 ? (
                      <button
                        onClick={() => setVehicleModalApartment(a)}
                        className="inline-flex items-center justify-center min-w-[2rem] rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 hover:underline cursor-pointer"
                        title="Xem chi tiết xe"
                      >
                        {a.carCount}
                      </button>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === 'VACANT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${a.status === 'VACANT' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {a.status === 'VACANT' ? 'Trống' : 'Đang ở'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 font-medium">
                    {a.soDienTieuThu != null ? Number(a.soDienTieuThu).toLocaleString('vi-VN') : '0'}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 font-medium">
                    {a.soNuocTieuThu != null ? Number(a.soNuocTieuThu).toLocaleString('vi-VN') : '0'}
                  </td>
                  {canWrite ? (
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Chi tiết"
                          onClick={() => setDetailApartment(a)}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Sửa"
                          onClick={() => {
                            setEditId(a.id);
                            setEditStatus({ submitting: false, error: '' });
                            setEditTouched({});
                            setEditForm({
                              apartmentNumber: a.apartmentNumber || '',
                              building: a.building || '',
                              floor: a.floor || '',
                              area: a.area == null ? '' : String(a.area),
                              status: a.status || 'VACANT',
                              motorbikeCount: a.motorbikeCount != null ? String(a.motorbikeCount) : '',
                              carCount: a.carCount != null ? String(a.carCount) : '',
                            });
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
                            if (!window.confirm(`Bạn có chắc chắn muốn xóa căn hộ ${a.apartmentNumber}? Hành động này không thể hoàn tác.`)) return;
                            try {
                              await deleteApartment(a.id);
                              setApartments((prev) => prev.filter((x) => x.id !== a.id));
                            } catch (err) {
                              const status = err?.response?.status;
                              if (status === 401 || status === 403) alert('Không có quyền (cần ADMIN).');
                              else alert('Không xóa được. Có thể đang có dữ liệu liên quan.');
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
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={canWrite ? 8 : 7}>
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
                <h2 className="text-lg font-semibold text-slate-900">Sửa thông tin căn hộ</h2>
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
                    apartmentNumber: true,
                    building: true,
                    floor: true,
                    area: true,
                    status: true,
                  });

                  if (!canSubmitEdit) {
                    setEditStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.' });
                    return;
                  }

                  setEditStatus({ submitting: true, error: '' });
                  try {
                    const payload = {
                      apartmentNumber: editForm.apartmentNumber.trim(),
                      building: editForm.building.trim() || null,
                      floor: editForm.floor.trim() || null,
                      area: editForm.area === '' ? null : Number(editForm.area),
                      status: editForm.status,
                      motorbikeCount: editForm.motorbikeCount === '' ? 0 : Number(editForm.motorbikeCount),
                      carCount: editForm.carCount === '' ? 0 : Number(editForm.carCount),
                    };

                    const updated = await updateApartment(editId, payload);
                    setApartments((prev) => prev.map((x) => (x.id === editId ? updated : x)));
                    setEditId(null);
                  } catch (err) {
                    const status = err?.response?.status;
                    if (status === 401 || status === 403)
                      setEditStatus({ submitting: false, error: 'Không có quyền (cần ADMIN).' });
                    else setEditStatus({ submitting: false, error: 'Không cập nhật được. Kiểm tra backend/log.' });
                  }
                }}
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Mã căn hộ</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
                    value={editForm.apartmentNumber}
                    disabled
                    readOnly
                  />
                  {editTouched.apartmentNumber && editErrors.apartmentNumber ? (
                    <div className="text-xs text-red-500">{editErrors.apartmentNumber}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Trạng thái <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                      value={editForm.status}
                      onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s === 'VACANT' ? 'Trống' : 'Đang ở'} ({s})
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {editTouched.status && editErrors.status ? (
                    <div className="text-xs text-red-500">{editErrors.status}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tòa</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={editForm.building}
                    onChange={(e) => setEditForm((f) => ({ ...f, building: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tầng</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={editForm.floor}
                    onChange={(e) => setEditForm((f) => ({ ...f, floor: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-slate-700">Diện tích (m²)</label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${editTouched.area && editErrors.area ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                    value={editForm.area}
                    onChange={(e) => setEditForm((f) => ({ ...f, area: e.target.value }))}
                    onBlur={() => setEditTouched((t) => ({ ...t, area: true }))}
                    inputMode="decimal"
                  />
                  {editTouched.area && editErrors.area ? (
                    <div className="text-xs text-red-500">{editErrors.area}</div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Số xe máy</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={editForm.motorbikeCount}
                    onChange={(e) => setEditForm((f) => ({ ...f, motorbikeCount: e.target.value }))}
                    placeholder="VD: 2"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Số ô tô</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    value={editForm.carCount}
                    onChange={(e) => setEditForm((f) => ({ ...f, carCount: e.target.value }))}
                    placeholder="VD: 1"
                    inputMode="numeric"
                  />
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

      {/* Modal chi tiết căn hộ */}
      <ApartmentDetailModal
        apartment={detailApartment}
        onClose={() => setDetailApartment(null)}
        canEdit={canWrite || auth?.role === 'CASHIER'}
        onUpdated={(updated) => {
          setApartments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          setDetailApartment(updated);
        }}
      />

      {/* Modal chi tiết phương tiện */}
      {vehicleModalApartment && (
        <VehicleListModal
          apartment={vehicleModalApartment}
          onClose={() => setVehicleModalApartment(null)}
        />
      )}
    </div>
  );
}

