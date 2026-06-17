import { useState, useEffect } from 'react';
import { updateConsumption } from '../../api/apartmentsApi.js';

export default function ApartmentDetailModal({ apartment, onClose, onUpdated, canEdit }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [soDien, setSoDien] = useState('');
  const [soNuoc, setSoNuoc] = useState('');

  useEffect(() => {
    if (apartment) {
      setSoDien(apartment.soDienTieuThu ?? 0);
      setSoNuoc(apartment.soNuocTieuThu ?? 0);
      setSuccess('');
    }
  }, [apartment]);

  if (!apartment) return null;

  const handleSaveConsumption = async () => {
    try {
      setSaving(true);
      setSuccess('');
      const updated = await updateConsumption(apartment.id, {
        soDienTieuThu: Number(soDien),
        soNuocTieuThu: Number(soNuoc),
      });
      setSuccess('Đã lưu số liệu tiêu thụ!');
      onUpdated(updated);
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  function fmt(val) {
    if (val == null) return '—';
    const n = Number(val);
    return Number.isFinite(n) ? n.toLocaleString('vi-VN') : String(val);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              🏠 Căn hộ {apartment.apartmentNumber}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {apartment.building ? `Tòa ${apartment.building}` : ''} {apartment.floor ? `· Tầng ${apartment.floor}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Diện tích</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {apartment.area ? `${fmt(apartment.area)} m²` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Trạng thái</p>
              <p className="mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  apartment.status === 'OCCUPIED'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${apartment.status === 'OCCUPIED' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  {apartment.status === 'OCCUPIED' ? 'Đang ở' : 'Trống'}
                </span>
              </p>
            </div>
          </div>

          {/* Số liệu tiêu thụ */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 flex items-center gap-2">
              📊 Số liệu tiêu thụ tháng này
            </h3>
            
            {success && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600">
                ✅ {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  ⚡ Số điện <span className="text-xs font-normal text-slate-400">(kWh)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={soDien}
                  onChange={(e) => { setSoDien(e.target.value); setSuccess(''); }}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  💧 Khối nước <span className="text-xs font-normal text-slate-400">(m³)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={soNuoc}
                  onChange={(e) => { setSoNuoc(e.target.value); setSuccess(''); }}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {canEdit && (
              <div className="mt-3">
                <button
                  onClick={handleSaveConsumption}
                  disabled={saving}
                  className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : '💾 Lưu số liệu tiêu thụ'}
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
            <strong>💡 Hướng dẫn:</strong> Nhập số điện (kWh) và khối nước (m³) mà căn hộ đã sử dụng trong tháng. Hệ thống sẽ tự động tính phí vào đầu tháng tiếp theo dựa trên đơn giá đã cấu hình.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
