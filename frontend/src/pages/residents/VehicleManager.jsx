import React, { useState, useEffect } from 'react';
import { fetchApartmentVehicles, addApartmentVehicle, deleteApartmentVehicle } from '../../api/apartmentsApi.js';

export default function VehicleManager({ apartmentId, onVehicleChanged }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addForm, setAddForm] = useState({ licensePlate: '', type: 'XE_MAY', color: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchApartmentVehicles(apartmentId);
      setVehicles(data);
    } catch (err) {
      setError('Không thể tải danh sách phương tiện.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [apartmentId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.licensePlate.trim()) {
      setAddError('Vui lòng nhập biển số xe.');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      await addApartmentVehicle(apartmentId, {
        licensePlate: addForm.licensePlate.trim(),
        type: addForm.type,
        color: addForm.color.trim()
      });
      setAddForm({ licensePlate: '', type: 'XE_MAY', color: '' });
      await fetchVehicles();
      if (onVehicleChanged) onVehicleChanged();
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Lỗi khi thêm phương tiện.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) return;
    try {
      await deleteApartmentVehicle(apartmentId, vehicleId);
      await fetchVehicles();
      if (onVehicleChanged) onVehicleChanged();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa phương tiện.');
    }
  };

  const translateType = (type) => {
    switch (type) {
      case 'O_TO': return 'Ô tô';
      case 'XE_MAY': return 'Xe máy';
      case 'XE_DAP_DIEN': return 'Xe đạp điện';
      default: return type || 'Khác';
    }
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-5 md:col-span-2">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Quản lý phương tiện</h3>
      
      {loading ? (
        <div className="text-sm text-slate-500 py-2">Đang tải danh sách phương tiện...</div>
      ) : error ? (
        <div className="text-sm text-red-500 py-2">{error}</div>
      ) : (
        <div className="space-y-4">
          {vehicles.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Biển số</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Loại xe</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Màu sắc</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 font-medium text-slate-900">{v.licensePlate}</td>
                      <td className="px-4 py-2 text-slate-600">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {translateType(v.type)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{v.color || '-'}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Xóa phương tiện"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic">Chưa có phương tiện nào.</div>
          )}

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 mt-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Thêm phương tiện mới</h4>
            {addError && <div className="text-xs text-red-500 mb-3">{addError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Biển số (*)"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                  value={addForm.licensePlate}
                  onChange={(e) => setAddForm({ ...addForm, licensePlate: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <select
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                >
                  <option value="XE_MAY">Xe máy</option>
                  <option value="XE_DAP_DIEN">Xe đạp điện</option>
                  <option value="O_TO">Ô tô</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Màu sắc"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                  value={addForm.color}
                  onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 active:scale-95 disabled:opacity-70"
                >
                  {adding ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
