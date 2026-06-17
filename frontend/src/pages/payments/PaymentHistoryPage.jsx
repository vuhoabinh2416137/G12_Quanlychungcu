import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { fetchPaymentHistoryByApartment } from '../../api/paymentsApi.js';
import { fetchApartments } from '../../api/apartmentsApi.js';

function formatCurrency(val) {
  if (val == null) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
}

function formatDateTime(val) {
  if (!val) return '---';
  return new Date(val).toLocaleString('vi-VN');
}

export default function PaymentHistoryPage() {
  const { auth } = useAuth();
  const isResident = auth?.role === 'RESIDENT';

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // 1. Load apartments
  useEffect(() => {
    let cancelled = false;
    async function loadApts() {
      try {
        const data = await fetchApartments();
        if (!cancelled) {
          setApartments(data);
          if (data.length > 0) {
            setSelectedApartmentId(String(data[0].id));
          } else {
            if (isResident) {
              setError('Bạn chưa được gán vào căn hộ nào.');
            } else {
              setError('Không có căn hộ nào.');
            }
            setLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Lỗi khi tải danh sách căn hộ.');
          setLoading(false);
        }
      }
    }
    loadApts();
    return () => { cancelled = true; };
  }, [isResident]);

  // 2. Load history when selectedApartmentId changes
  useEffect(() => {
    let cancelled = false;
    if (!selectedApartmentId) return;

    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPaymentHistoryByApartment(selectedApartmentId, isResident);
        if (!cancelled) setHistory(data);
      } catch (err) {
        if (!cancelled) setError('Không tải được lịch sử thanh toán.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [selectedApartmentId, isResident]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const searchStr = `${item.receiptNumber || ''} ${item.feeName || ''} ${item.note || ''} ${item.method || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [query, history]);

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch sử thanh toán</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem lịch sử các giao dịch thanh toán (hóa đơn) đã hoàn thành.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!isResident && apartments.length > 0 && (
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>Căn hộ {a.apartmentNumber}</option>
              ))}
            </select>
          )}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 bg-surface pl-10 pr-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
              placeholder="Tìm mã biên lai, tên phí..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="text-slate-600">Đang tải lịch sử thanh toán...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Mã Biên Lai</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Tên Phí</th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-600">Số Tiền</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Phương Thức</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Ngày Thanh Toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-900">{item.receiptNumber || `PAY-${item.id}`}</td>
                    <td className="px-5 py-4 text-slate-600">{item.feeName || 'Phí chung cư'}</td>
                    <td className="px-5 py-4 text-right font-semibold text-primary-600">{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.method || 'TIỀN MẶT'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(item.transferTime || item.paymentDate)}</td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={5}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mb-2 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-slate-900">Không có dữ liệu thanh toán.</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
