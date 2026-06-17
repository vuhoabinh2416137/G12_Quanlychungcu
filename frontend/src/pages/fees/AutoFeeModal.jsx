import { useState, useEffect } from 'react';
import { fetchFeeConfigs, updateFeeConfigs } from '../../api/systemConfigApi.js';

export default function AutoFeeModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    'fee.management_per_sqm': '10000',
    'fee.electricity_per_kwh': '3500',
    'fee.water_per_m3': '15000',
    'fee.motorbike': '150000',
    'fee.car': '1000000',
    'fee.due_day_of_month': '15',
  });

  useEffect(() => {
    if (!isOpen) return;
    setSuccess('');
    setLoadingConfig(true);
    fetchFeeConfigs()
      .then((data) => setFormData((prev) => ({ ...prev, ...data })))
      .catch((err) => console.warn('Không tải được cấu hình:', err))
      .finally(() => setLoadingConfig(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccess('');
      await updateFeeConfigs(formData);
      setSuccess('Đã lưu cấu hình thành công! Phí sẽ tự động được tạo vào đầu mỗi tháng.');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('vi-VN');
  }

  const feeFields = [
    { key: 'fee.management_per_sqm', label: 'Phí quản lý', unit: 'VNĐ / m²', icon: '🏢' },
    { key: 'fee.electricity_per_kwh', label: 'Phí điện', unit: 'VNĐ / kWh', icon: '⚡' },
    { key: 'fee.water_per_m3', label: 'Phí nước', unit: 'VNĐ / m³', icon: '💧' },
    { key: 'fee.motorbike', label: 'Phí gửi xe máy', unit: 'VNĐ / xe', icon: '🏍️' },
    { key: 'fee.car', label: 'Phí gửi ô tô', unit: 'VNĐ / xe', icon: '🚗' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">⚙️ Cấu hình phí hàng tháng</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Thiết lập đơn giá. Hệ thống tự động phát phí đầu mỗi tháng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loadingConfig ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <svg className="mr-2 h-5 w-5 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
              </svg>
              Đang tải cấu hình...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                <strong>💡 Lưu ý:</strong> Đơn giá bên dưới được dùng bởi hệ thống tự động phát phí vào đầu mỗi tháng. Phí điện/nước sẽ tính theo số liệu tiêu thụ thực tế nhập ở chi tiết căn hộ.
              </div>

              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  ✅ {success}
                </div>
              )}

              {/* Fee fields */}
              <div className="space-y-3">
                {feeFields.map(({ key, label, unit, icon }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        {label} <span className="text-xs font-normal text-slate-400">({unit})</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          step="100"
                          value={formData[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-24 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          ≈ {formatMoney(formData[key])} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Due day of month */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  📅 Hạn nộp hàng tháng
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Ngày</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max="28"
                    value={formData['fee.due_day_of_month']}
                    onChange={(e) => handleChange('fee.due_day_of_month', e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">hàng tháng</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Hệ thống tự động tạo phí vào 00:00 ngày mùng 1 hàng tháng. Hạn nộp sẽ là ngày này trong tháng phát sinh.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
