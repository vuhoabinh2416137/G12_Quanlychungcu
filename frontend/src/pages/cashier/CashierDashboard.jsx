import React, { useEffect, useState } from 'react';
import { fetchPendingPayments, confirmPayment, fetchRefunds, confirmRefund } from '../../api/paymentsApi.js';

export default function CashierDashboard() {
  const [activeTab, setActiveTab] = useState('PENDING_PAYMENTS');
  
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualAmount, setActualAmount] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'PENDING_PAYMENTS') {
        const data = await fetchPendingPayments();
        setPayments(data);
      } else {
        const data = await fetchRefunds();
        setRefunds(data);
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu.');
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
      loadData();
    } catch (err) {
      alert('Lỗi khi xác nhận thanh toán.');
    }
  };

  const handleConfirmRefundClick = async (paymentId) => {
    if (!window.confirm("Xác nhận đã hoàn trả số tiền thừa cho cư dân?")) return;
    try {
      await confirmRefund(paymentId);
      alert('Xác nhận hoàn tiền thành công!');
      loadData();
    } catch (err) {
      alert('Lỗi khi xác nhận hoàn tiền.');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Thu ngân</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý giao dịch thanh toán và các yêu cầu hoàn trả tiền nộp thừa.</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'PENDING_PAYMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('PENDING_PAYMENTS')}
        >
          Thanh toán chờ xác nhận
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'REFUNDS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('REFUNDS')}
        >
          Quản lý hoàn tiền
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
        {activeTab === 'PENDING_PAYMENTS' ? (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Căn hộ</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Loại phí</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Thời gian CK</th>
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
                  <td className="px-6 py-4">{p.transferTime ? new Date(p.transferTime).toLocaleString('vi-VN') : (p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : '---')}</td>
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
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Không có thanh toán nào chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">ID Giao dịch</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Căn hộ</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Số tiền hoàn (VND)</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Thông tin Ngân hàng</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Trạng thái</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-slate-600">#{r.id}</td>
                  <td className="px-6 py-4 font-medium">{r.apartmentNumber}</td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-600">{r.refundAmount?.toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    {r.refundBank ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{r.refundAccountName}</span>
                        <span className="text-slate-600">{r.refundAccountNumber} - {r.refundBank}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa cung cấp</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.refundStatus === 'PENDING_INFO' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Chờ cư dân nhập
                      </span>
                    )}
                    {r.refundStatus === 'PENDING_REFUND' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        Chờ hoàn trả
                      </span>
                    )}
                    {r.refundStatus === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Đã hoàn tất
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.refundStatus === 'PENDING_REFUND' && (
                      <button
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        onClick={() => handleConfirmRefundClick(r.id)}
                      >
                        Xác nhận hoàn trả
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {refunds.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Không có yêu cầu hoàn tiền nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
