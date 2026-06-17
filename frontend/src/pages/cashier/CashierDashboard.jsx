import React, { useEffect, useState } from 'react';
import { fetchPendingPayments, confirmPayment } from '../../api/paymentsApi.js';

export default function CashierDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualAmount, setActualAmount] = useState({});

  useEffect(() => {
    loadPendingPayments();
  }, []);

  async function loadPendingPayments() {
    setLoading(true);
    try {
      const data = await fetchPendingPayments();
      setPayments(data);
    } catch (err) {
      setError('Lỗi khi tải danh sách thanh toán chờ duyệt.');
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async (paymentId) => {
    const amount = Number(actualAmount[paymentId]);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền thực nhận hợp lệ.');
      return;
    }
    try {
      await confirmPayment(paymentId, amount);
      alert('Xác nhận thành công!');
      loadPendingPayments();
    } catch (err) {
      alert('Lỗi khi xác nhận thanh toán.');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Duyệt thanh toán chờ xác nhận</h1>
        <p className="mt-1 text-sm text-slate-500">Các giao dịch chuyển khoản từ cư dân cần được đối soát và ghi nhận số tiền thực tế.</p>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">ID</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Căn hộ</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Loại phí</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Phương thức</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Số tiền cần đóng</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Số tiền thực nhận (VND)</th>
              <th className="px-6 py-4 text-center font-semibold text-slate-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">{p.id}</td>
                <td className="px-6 py-4 font-medium">{p.apartmentNumber}</td>
                <td className="px-6 py-4">{p.feeName}</td>
                <td className="px-6 py-4">{p.method}</td>
                <td className="px-6 py-4 text-right font-semibold">{p.amount?.toLocaleString('vi-VN')}</td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-right text-sm"
                    placeholder="Nhập số tiền"
                    value={actualAmount[p.id] || ''}
                    onChange={(e) => setActualAmount({ ...actualAmount, [p.id]: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    onClick={() => handleConfirm(p.id)}
                  >
                    Xác nhận
                  </button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  Không có thanh toán nào chờ duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
