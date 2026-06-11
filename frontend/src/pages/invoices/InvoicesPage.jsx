import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { fetchApartments } from '../../api/apartmentsApi.js';
import { getAllInvoices, getInvoicesByApartment } from '../../api/invoicesApi.js';

export default function InvoicesPage() {
  const { auth } = useAuth();
  const isAdminOrManager = auth?.role === 'ADMIN' || auth?.role === 'MANAGER';

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const data = await fetchApartments();
        if (cancelled) return;
        setApartments(data);
        if (!isAdminOrManager && data.length > 0) {
          setSelectedApartmentId(String(data[0].id));
        }
      } catch (err) {
        if (!cancelled) console.error('Không tải được apartments', err);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [isAdminOrManager]);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      setError('');
      try {
        let data = [];
        if (isAdminOrManager && !selectedApartmentId) {
          data = await getAllInvoices();
        } else if (selectedApartmentId) {
          data = await getInvoicesByApartment(Number(selectedApartmentId));
        }

        data.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
        setInvoices(data);
      } catch (err) {
        setError('Không tải được danh sách hóa đơn.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [isAdminOrManager, selectedApartmentId]);

  function toggleExpand(invoiceId) {
    setExpandedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceId)) next.delete(invoiceId);
      else next.add(invoiceId);
      return next;
    });
  }

  function formatMoney(val) {
    if (val == null) return '0';
    return Number(val).toLocaleString('vi-VN');
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN');
  }

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hóa đơn điện tử</h1>
          <p className="mt-1 text-sm text-slate-500">Tab này chỉ hiển thị kết quả tổng hợp từ các khoản phí đã/chưa thanh toán.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(e.target.value)}
          >
            {isAdminOrManager ? <option value="">Tất cả hóa đơn</option> : <option value="" disabled>-- Chọn căn hộ --</option>}
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>Căn hộ P.{a.apartmentNumber}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải danh sách hóa đơn...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">Chưa có hóa đơn nào cho căn hộ này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Mã hóa đơn</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Phòng</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Tổng tiền</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Ngày tạo</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const isExpanded = expandedInvoiceIds.has(inv.id);
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className={`transition-colors hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 text-slate-600">P.{inv.apartmentNumber}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">{formatMoney(inv.totalAmount)} đ</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(inv.issuedDate)}</td>
                        <td className="px-6 py-4">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                              Đã thanh toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              Chưa thanh toán
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(inv.id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-800">Chi tiết các khoản phí trong hóa đơn</h4>
                              {inv.fees && inv.fees.length > 0 ? (
                                <ul className="space-y-2">
                                  {inv.fees.map((fee) => (
                                    <li key={fee.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0">
                                      <div>
                                        <span className="font-medium text-slate-700">{fee.name}</span>
                                        <span className="ml-2 text-xs text-slate-400">({fee.type || 'N/A'})</span>
                                      </div>
                                      <span className="font-semibold text-slate-600">{formatMoney(fee.amount)} đ</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-500">Không có dữ liệu khoản phí.</p>
                              )}
                              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                                <span className="font-semibold text-slate-800">Tổng cộng:</span>
                                <span className="text-lg font-bold text-emerald-600">{formatMoney(inv.totalAmount)} đ</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
