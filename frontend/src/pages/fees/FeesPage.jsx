import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApartments } from '../../api/apartmentsApi.js';
import {
  createFeeForAllApartments,
  createFeeForApartment,
  fetchFeesByApartment,
  fetchFees,
  updateFeePaidStatus,
} from '../../api/feesApi.js';
import { createPayment } from '../../api/paymentsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isNonEmptyString, isValidISODate } from '../../utils/validators.js';
import QrPaymentModal from '../../components/payment/QrPaymentModal.jsx';
import AutoFeeModal from './AutoFeeModal.jsx';

const FEE_TYPES = ['DIEN', 'NUOC', 'QUAN_LY', 'GUI_XE', 'KHAC'];

function validateFee(form) {
  const errors = {};
  if (!isNonEmptyString(form.name)) errors.name = 'Tên khoản phí là bắt buộc.';

  const amountNum = Number(form.amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) errors.amount = 'Số tiền phải là số > 0.';

  if (form.dueDate && !isValidISODate(form.dueDate)) errors.dueDate = 'Hạn nộp phải là YYYY-MM-DD.';

  return errors;
}

function formatMoney(value) {
  if (value == null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('vi-VN');
}

function getFeeTypeLabel(type) {
  if (type === 'DIEN') return 'Điện';
  if (type === 'NUOC') return 'Nước';
  if (type === 'QUAN_LY') return 'Quản lý';
  if (type === 'GUI_XE') return 'Gửi xe';
  return 'Khác';
}

export default function FeesPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const canCreate = auth?.role === 'ADMIN' || auth?.role === 'CASHIER';
  const canMarkPaid = auth?.role === 'ADMIN' || auth?.role === 'CASHIER';
  const canActOnFees = canMarkPaid || auth?.role === 'RESIDENT';

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedFeeForQR, setSelectedFeeForQR] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState('apartment');
  const [createTouched, setCreateTouched] = useState({});
  const [createStatus, setCreateStatus] = useState({ submitting: false, error: '', success: '' });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'KHAC',
    dueDate: '',
  });

  async function reloadFees(apartmentId) {
    if (!apartmentId) return;
    let data;
    if (apartmentId === 'ALL') {
      data = await fetchFees();
    } else {
      data = await fetchFeesByApartment(Number(apartmentId));
    }
    setFees(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchApartments();
        const occupiedApts = data.filter(a => a.status === 'OCCUPIED');
        if (cancelled) return;
        setApartments(occupiedApts);
        if (occupiedApts.length > 0) {
          setSelectedApartmentId('ALL');
        }
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại.');
        else if (status === 403) setError('403 Forbidden: không đủ quyền xem căn hộ.');
        else setError('Không tải được danh sách căn hộ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFees() {
      if (!selectedApartmentId) return;
      setLoading(true);
      setError('');
      try {
        let data;
        if (selectedApartmentId === 'ALL') {
          data = await fetchFees();
        } else {
          data = await fetchFeesByApartment(Number(selectedApartmentId));
        }
        if (!cancelled) setFees(data);
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại.');
        else if (status === 403) setError('403 Forbidden: không đủ quyền xem phí.');
        else setError('Không tải được khoản phí. Kiểm tra backend.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFees();
    return () => {
      cancelled = true;
    };
  }, [selectedApartmentId]);

  const createErrors = useMemo(() => validateFee(createForm), [createForm]);
  const canSubmitCreate = useMemo(() => Object.keys(createErrors).length === 0, [createErrors]);

  const filteredFees = useMemo(() => {
    const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(query.trim());
    if (!q) return fees;
    return fees.filter((f) => {
      const typeLabel = getFeeTypeLabel(f.type);
      const searchStr = `${f.name || ''} ${f.apartmentNumber || ''} ${formatMoney(f.amount)} ${typeLabel}`.toLowerCase();
      return normalize(searchStr).includes(q);
    });
  }, [query, fees]);

  if (loading && !apartments.length) return <div className="text-slate-600">Đang tải khoản phí...</div>;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý khoản phí</h1>
          <p className="mt-1 text-sm text-slate-500">Hiển thị các khoản phí và trạng thái đã hoặc chưa thanh toán của từng căn hộ.</p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {!auth?.role?.includes('RESIDENT') && apartments.length > 0 && (
            <div className="relative w-full sm:w-64">
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-surface py-2 pl-4 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
              >
                <option value="ALL">Tất cả chung cư</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    P.{a.apartmentNumber} - {a.status === 'OCCUPIED' ? 'Đang ở' : 'Trống'} {a.building ? `(${a.building})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 bg-surface pl-10 pr-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
              placeholder="Tìm tên phí, loại, mã căn..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {canCreate ? (
            <>
              <button
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 active:scale-95 sm:w-auto"
                onClick={() => setIsAutoModalOpen(true)}
              >
                ⚙️ Cấu hình phí hàng tháng
              </button>
              <button
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 sm:w-auto"
                onClick={() => {
                  setCreateStatus({ submitting: false, error: '', success: '' });
                  setCreateOpen((v) => !v);
                }}
              >
                ➕ Tạo khoản phí phát sinh
              </button>
            </>
          ) : null}
        </div>
      </div>

      {createOpen && canCreate ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Thêm khoản phí phát sinh</h2>
              <p className="mt-0.5 text-sm text-slate-500">Dùng cho các khoản phí phát sinh ngoài phí cố định hàng tháng.</p>
            </div>
            <button
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              onClick={() => setCreateOpen(false)}
            >
              X
            </button>
          </div>

          <div className="px-6 pb-2 pt-5">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  createMode === 'apartment'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                onClick={() => setCreateMode('apartment')}
              >
                Giao cho căn hộ đang chọn
              </button>
              <button
                type="button"
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  createMode === 'all'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                onClick={() => setCreateMode('all')}
              >
                Giao hàng loạt
              </button>
            </div>
          </div>

          <div className="p-6 pt-3">
            {createStatus.error ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{createStatus.error}</div>
            ) : null}
            {createStatus.success ? (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">{createStatus.success}</div>
            ) : null}

            <form
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateTouched({ name: true, amount: true, dueDate: true });

                if (!canSubmitCreate) {
                  setCreateStatus({ submitting: false, error: 'Vui lòng kiểm tra lại các trường bị lỗi.', success: '' });
                  return;
                }

                setCreateStatus({ submitting: true, error: '', success: '' });
                try {
                  const payload = {
                    name: createForm.name.trim(),
                    description: createForm.description.trim() || null,
                    amount: Number(createForm.amount),
                    type: 'KHAC',
                    dueDate: createForm.dueDate ? createForm.dueDate.trim() : null,
                  };

                  if (createMode === 'apartment') {
                    if (!selectedApartmentId) {
                      setCreateStatus({ submitting: false, error: 'Vui lòng chọn căn hộ ở góc trên.', success: '' });
                      return;
                    }
                    const created = await createFeeForApartment(Number(selectedApartmentId), payload);
                    setFees((prev) => [created, ...prev]);
                    setCreateStatus({ submitting: false, error: '', success: 'Tạo phí thành công.' });
                  } else {
                    await createFeeForAllApartments(payload);
                    if (selectedApartmentId) {
                      await reloadFees(selectedApartmentId);
                    }
                    setCreateStatus({ submitting: false, error: '', success: 'Tạo phí hàng loạt thành công.' });
                  }

                  setCreateForm({ name: '', description: '', amount: '', type: 'KHAC', dueDate: '' });
                  setCreateTouched({});
                } catch (err) {
                  const status = err?.response?.status;
                  if (status === 401 || status === 403) {
                    setCreateStatus({ submitting: false, error: 'Không có quyền (cần ADMIN).', success: '' });
                  } else {
                    setCreateStatus({ submitting: false, error: 'Không tạo được phí. Kiểm tra backend/log.', success: '' });
                  }
                }
              }}
            >
              <div className="space-y-1.5 lg:col-span-3">
                <label className="text-sm font-medium text-slate-700">Tên phí <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.name && createErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, name: true }))}
                />
              </div>

              <div className="space-y-1.5 lg:col-span-3">
                <label className="text-sm font-medium text-slate-700">Mô tả</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số tiền / Đơn giá <span className="text-red-500">*</span></label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.amount && createErrors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.amount}
                  onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, amount: true }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Hạn nộp</label>
                <input
                  type="date"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-4 ${createTouched.dueDate && createErrors.dueDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'}`}
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))}
                  onBlur={() => setCreateTouched((t) => ({ ...t, dueDate: true }))}
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2 lg:col-span-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  onClick={() => {
                    setCreateForm({ name: '', description: '', amount: '', type: 'KHAC', dueDate: '' });
                    setCreateTouched({});
                    setCreateStatus({ submitting: false, error: '', success: '' });
                  }}
                >
                  Xóa trắng
                </button>
                <button
                  type="submit"
                  disabled={createStatus.submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
                >
                  {createStatus.submitting ? 'Đang xử lý...' : 'Phát hành khoản phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Căn hộ</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Tên phí</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Loại</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Số tiền (VND)</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Hạn nộp</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Trạng thái</th>
                {canActOnFees ? <th className="px-6 py-4 text-right font-semibold text-slate-600">Hành động</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.filter(f => !f.paid).map((f) => (
                <tr key={f.id} className="group transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{f.apartmentNumber || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{f.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                      {getFeeTypeLabel(f.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-900">{formatMoney(f.amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {f.dueDate ? (
                      <span className={new Date(f.dueDate) < new Date() && !f.paid ? 'font-medium text-red-600' : ''}>
                        {f.dueDate}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {f.paymentStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        Chờ xác nhận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Chưa thanh toán
                      </span>
                    )}
                  </td>
                  {canActOnFees ? (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canMarkPaid && !f.paid ? (
                          f.paymentStatus === 'PENDING' ? (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              onClick={() => navigate('/cashier')}
                            >
                              Xác nhận
                            </button>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                              onClick={async () => {
                                try {
                                  await createPayment(f.id, {
                                    amount: f.amount,
                                    method: 'TRỰC TIẾP',
                                    note: 'Thu tiền trực tiếp',
                                    transferTime: new Date().toISOString()
                                  });
                                  alert('Thu tiền thành công!');
                                  reloadFees(selectedApartmentId);
                                } catch (e) {
                                  const status = e?.response?.status;
                                  if (status === 401 || status === 403) alert('Không có quyền tạo thanh toán.');
                                  else alert('Không tạo được thanh toán. Kiểm tra backend/log.');
                                }
                              }}
                            >
                              Thu tiền
                            </button>
                          )
                        ) : null}
                        {auth?.role === 'RESIDENT' && !f.paid && f.paymentStatus !== 'PENDING' ? (
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            onClick={() => setSelectedFeeForQR(f)}
                          >
                            Thanh toán QR
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
              {filteredFees.filter(f => !f.paid).length === 0 && !loading ? (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-500" colSpan={canActOnFees ? 7 : 6}>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-slate-900">Chưa có khoản phí nào</p>
                      <p className="mt-1 text-xs text-slate-500">Căn hộ này hiện không có khoản nợ/phí nào cần thanh toán.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedFeeForQR && (
        <QrPaymentModal
          fee={selectedFeeForQR}
          onClose={() => setSelectedFeeForQR(null)}
          onSuccess={() => {
            setSelectedFeeForQR(null);
            alert('Đã gửi yêu cầu xác nhận thanh toán cho thủ quỹ.');
            reloadFees(selectedApartmentId);
          }}
        />
      )}
      {/* Modal Cấu hình phí */}
      <AutoFeeModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
      />

    </div>
  );
}
