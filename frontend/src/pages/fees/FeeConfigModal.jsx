import { useState, useEffect } from 'react';
import { fetchFeeConfigs, updateFeeConfigs } from '../../api/systemConfigApi.js';

const CONFIG_LABELS = {
  'fee.management_per_sqm': { label: 'Đơn giá phí quản lý (VNĐ/m²)', placeholder: '10000' },
  'fee.motorbike': { label: 'Đơn giá gửi xe máy (VNĐ/xe/tháng)', placeholder: '150000' },
  'fee.car': { label: 'Đơn giá gửi ô tô (VNĐ/xe/tháng)', placeholder: '1000000' },
};

function formatMoney(value) {
  if (!value) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('vi-VN');
}

export default function FeeConfigModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    setLoading(true);

    fetchFeeConfigs()
      .then((data) => {
        setConfigs(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Không thể tải cấu hình phí. Kiểm tra backend.');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    for (const [key, val] of Object.entries(configs)) {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) {
        setError(`Giá trị "${CONFIG_LABELS[key]?.label || key}" không hợp lệ. Vui lòng nhập số >= 0.`);
        return;
      }
    }

    try {
      setSaving(true);
      const updated = await updateFeeConfigs(configs);
      setConfigs(updated);
      setSuccess('Đã lưu cấu hình thành công!');
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Không có quyền cập nhật cấu hình.');
      } else {
        setError('Lỗi khi lưu cấu hình: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">⚙️ Cấu hình đơn giá phí cố định</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Thiết lập đơn giá được dùng khi phát phí tự động hàng tháng.
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
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <svg className="mr-2 h-5 w-5 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
              </svg>
              Đang tải cấu hình...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  {success}
                </div>
              )}

              {Object.keys(CONFIG_LABELS).map((key) => {
                const meta = CONFIG_LABELS[key];
                const currentValue = configs[key] || '';
                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">{meta.label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={currentValue}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={meta.placeholder}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-20 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        ≈ {formatMoney(currentValue)} ₫
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Info box */}
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3.5 text-xs text-blue-700">
                <strong>💡 Lưu ý:</strong> Các đơn giá này được sử dụng bởi:
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>Tác vụ <b>phát phí tự động</b> vào ngày mùng 1 hàng tháng.</li>
                  <li>Nút <b>"Phát phí cố định"</b> do Admin/Thủ quỹ bấm thủ công.</li>
                </ul>
              </div>

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
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
