import React, { useEffect, useState } from 'react';
import { fetchApartmentVehicles } from '../../api/apartmentsApi.js';

export default function VehicleListModal({ apartment, onClose }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchApartmentVehicles(apartment.id);
        if (!cancelled) setVehicles(data);
      } catch (err) {
        if (!cancelled) setError('Không thể tải danh sách phương tiện.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [apartment.id]);

  const translateType = (type) => {
    switch (type) {
      case 'O_TO': return 'Ô tô';
      case 'XE_MAY': return 'Xe máy';
      case 'XE_DAP_DIEN': return 'Xe đạp điện';
      default: return type || 'Khác';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Phương tiện - Căn {apartment.apartmentNumber}</h2>
            <p className="mt-0.5 text-sm text-slate-500">Chi tiết phương tiện đăng ký của căn hộ</p>
          </div>
          <button
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
              <svg className="h-6 w-6 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Không có dữ liệu phương tiện nào.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Biển số</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Loại xe</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Màu sắc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{v.licensePlate}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {translateType(v.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{v.color || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
          <button
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
