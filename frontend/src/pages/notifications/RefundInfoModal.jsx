import React, { useState, useEffect } from 'react';
import { submitRefundInfo, fetchLastRefundInfo } from '../../api/paymentsApi.js';

export default function RefundInfoModal({ isOpen, onClose, paymentId, onSuccess }) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastInfo, setLastInfo] = useState(null);

  useEffect(() => {
    if (isOpen && paymentId) {
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setError('');
      setLastInfo(null);
      
      fetchLastRefundInfo(paymentId)
        .then(data => {
          if (data) setLastInfo(data);
        })
        .catch(err => console.error("Could not fetch last refund info:", err));
    }
  }, [isOpen, paymentId]);

  if (!isOpen) return null;

  const handleAccountNameChange = (e) => {
    // Tự động bỏ dấu và viết hoa
    const val = e.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    setAccountName(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitRefundInfo(paymentId, bankName.trim(), accountNumber.trim(), accountName.trim());
      onSuccess();
    } catch (err) {
      setError('Không thể gửi thông tin. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Thông tin nhận hoàn tiền</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

          {lastInfo && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Đã từng dùng tài khoản:</p>
              <p className="text-sm text-blue-900 mb-3">
                <span className="font-semibold">{lastInfo.accountName}</span> - {lastInfo.bankName} - {lastInfo.accountNumber}
              </p>
              <button
                type="button"
                onClick={() => {
                  setBankName(lastInfo.bankName);
                  setAccountNumber(lastInfo.accountNumber);
                  setAccountName(lastInfo.accountName);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
              >
                Sử dụng tài khoản cũ này
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ngân hàng</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ví dụ: Vietcombank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ví dụ: 0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên chủ tài khoản</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
              placeholder="NGUYEN VAN A"
              value={accountName}
              onChange={handleAccountNameChange}
            />
            <p className="mt-1 text-xs text-slate-500">Tự động viết hoa không dấu</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
