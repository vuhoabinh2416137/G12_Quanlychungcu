import React, { useState, useEffect } from 'react';
import { createPayment } from '../../api/paymentsApi.js';

export default function QrPaymentModal({ fee, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Format current time for datetime-local input: YYYY-MM-DDThh:mm
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
  
  const [transferTime, setTransferTime] = useState(localISOTime);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const transferTimeISO = transferTime ? new Date(transferTime).toISOString() : new Date().toISOString();
      await createPayment(fee.id, {
        amount: fee.amount,
        method: 'QR',
        note: 'Đã thanh toán qua QR',
        transferTime: transferTimeISO
      });
      onSuccess();
    } catch (err) {
      console.error("QrPaymentModal error:", err);
      console.error("Response data:", err.response?.data);
      setError('Lỗi khi gửi yêu cầu thanh toán. ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">Thanh toán khoản phí</h2>
        <p className="mb-4 text-center text-sm text-slate-600">Quét mã QR bên dưới để thanh toán {fee.name} ({fee.amount?.toLocaleString('vi-VN')} VND)</p>
        
        <div className="mb-6 flex justify-center">
          <img src="/IMG_0792.jpg" alt="Mã QR Thanh Toán" className="h-64 w-64 rounded-xl object-cover shadow-sm" />
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 shadow-sm border border-blue-100">
          <div className="flex justify-between border-b border-blue-200/60 pb-2 mb-2">
            <span className="font-medium">Ngân hàng:</span>
            <span className="font-semibold">Techcombank</span>
          </div>
          <div className="flex justify-between border-b border-blue-200/60 pb-2 mb-2">
            <span className="font-medium">Số tài khoản:</span>
            <span className="font-semibold tracking-wide">19036728374011</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Chủ tài khoản:</span>
            <span className="font-semibold text-right">BQL CHUNG CU BLUEMOON</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian bạn đã chuyển khoản</label>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            value={transferTime}
            onChange={(e) => setTransferTime(e.target.value)}
          />
        </div>

        {error && <div className="mb-4 text-center text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button
            className="w-1/2 rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            onClick={onClose}
            disabled={submitting}
          >
            Đóng
          </button>
          <button
            className="w-1/2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Đang xử lý...' : 'Đã chuyển khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}
