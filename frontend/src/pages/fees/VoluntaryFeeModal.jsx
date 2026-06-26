import React, { useState } from 'react';
import { submitVoluntaryPayment } from '../../api/paymentsApi.js';

export default function VoluntaryFeeModal({ isOpen, onClose, apartmentId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: QR Code
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    setError('');
    setStep(2);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitVoluntaryPayment(apartmentId, {
        amount: 0,
        method: 'QR',
        note: note || 'Đóng góp tự nguyện',
        transferTime: new Date().toISOString()
      });
      onSuccess();
      setStep(1);
      setAmount('');
      setNote('');
    } catch (err) {
      console.error("VoluntaryFeeModal error:", err);
      setError('Lỗi khi gửi yêu cầu. ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">Đóng phí tự nguyện</h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Nhập ghi chú cho khoản đóng góp tự nguyện của bạn.</p>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Ghi chú</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Ủng hộ quỹ vì người nghèo"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-3 pt-4">
              <button
                className="w-1/2 rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                className="w-1/2 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                onClick={handleNext}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-center text-sm text-slate-600">Quét mã QR bên dưới để chuyển khoản</p>
            
            <div className="flex justify-center">
              <img src="/IMG_0792.jpg" alt="Mã QR Thanh Toán" className="h-64 w-64 rounded-xl object-cover shadow-sm" />
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 shadow-sm border border-blue-100">
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

            {error && <div className="text-center text-sm text-red-600">{error}</div>}

            <div className="flex gap-3 pt-4">
              <button
                className="w-1/2 rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                Quay lại
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
        )}
      </div>
    </div>
  );
}
