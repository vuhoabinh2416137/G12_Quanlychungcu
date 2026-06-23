import React, { useEffect, useMemo, useState } from 'react';
import { fetchApartments, fetchApartmentVehicles, fetchAllVehicles, addApartmentVehicle, deleteApartmentVehicle, updateApartmentVehicle } from '../../api/apartmentsApi.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function VehiclesPage() {
  const { auth } = useAuth();
  const isAdmin = auth?.role === 'ADMIN';
  const isResident = auth?.role === 'RESIDENT';

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [addForm, setAddForm] = useState({ apartmentId: '', licensePlate: '', type: 'XE_MAY', color: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [editVehicle, setEditVehicle] = useState(null);
  const [editForm, setEditForm] = useState({ licensePlate: '', type: 'XE_MAY', color: '' });
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Fetch apartments
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const data = await fetchApartments();
        const occupiedApts = data.filter(a => a.status === 'OCCUPIED');
        if (cancelled) return;
        setApartments(occupiedApts);
        if (occupiedApts.length > 0) {
          if (isResident) {
            setSelectedApartmentId(String(occupiedApts[0].id));
          } else {
            setSelectedApartmentId('ALL');
          }
        }
      } catch (e) {
        if (!cancelled) setError('Không tải được danh sách căn hộ.');
      }
    }
    init();
    return () => { cancelled = true; };
  }, [isResident]);

  // Fetch vehicles
  useEffect(() => {
    let cancelled = false;
    async function loadVehicles() {
      if (!selectedApartmentId) return;
      setLoading(true);
      setError('');
      try {
        let data;
        if (selectedApartmentId === 'ALL') {
          data = await fetchAllVehicles();
        } else {
          data = await fetchApartmentVehicles(Number(selectedApartmentId));
          // If fetching by apartment, make sure apartmentNumber is populated for filtering
          const apt = apartments.find(a => String(a.id) === String(selectedApartmentId));
          if (apt) {
            data = data.map(v => ({ ...v, apartmentNumber: apt.apartmentNumber }));
          }
        }
        if (!cancelled) setVehicles(data);
      } catch (e) {
        if (!cancelled) setError('Không tải được danh sách phương tiện.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVehicles();
    return () => { cancelled = true; };
  }, [selectedApartmentId, apartments]);

  const translateType = (type) => {
    switch (type) {
      case 'O_TO': return 'Ô tô';
      case 'XE_MAY': return 'Xe máy';
      case 'XE_DAP_DIEN': return 'Xe đạp điện';
      default: return type || 'Khác';
    }
  };

  const filteredVehicles = useMemo(() => {
    const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(query.trim());
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const typeLabel = translateType(v.type);
      const searchStr = `${v.licensePlate || ''} ${v.apartmentNumber || ''} ${v.color || ''} ${typeLabel}`.toLowerCase();
      return normalize(searchStr).includes(q);
    });
  }, [query, vehicles]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.licensePlate.trim()) {
      setAddError('Vui lòng nhập biển số xe.');
      return;
    }
    
    // Determine target apartment
    let targetAptId = addForm.apartmentId;
    if (!targetAptId && selectedApartmentId !== 'ALL') {
      targetAptId = selectedApartmentId;
    }
    
    if (!targetAptId || targetAptId === 'ALL') {
      setAddError('Vui lòng chọn căn hộ để thêm phương tiện.');
      return;
    }

    setAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      await addApartmentVehicle(targetAptId, {
        licensePlate: addForm.licensePlate.trim(),
        type: addForm.type,
        color: addForm.color.trim()
      });
      setAddForm({ apartmentId: '', licensePlate: '', type: 'XE_MAY', color: '' });
      setAddSuccess('Thêm phương tiện thành công.');
      
      // Reload vehicles
      if (selectedApartmentId === 'ALL') {
        const data = await fetchAllVehicles();
        setVehicles(data);
      } else {
        const data = await fetchApartmentVehicles(Number(selectedApartmentId));
        const apt = apartments.find(a => String(a.id) === String(selectedApartmentId));
        setVehicles(data.map(v => ({ ...v, apartmentNumber: apt?.apartmentNumber })));
      }
      
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Lỗi khi thêm phương tiện.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.licensePlate.trim()) {
      setEditError('Vui lòng nhập biển số xe.');
      return;
    }

    setEditing(true);
    setEditError('');
    setEditSuccess('');
    try {
      await updateApartmentVehicle(editVehicle.apartmentId, editVehicle.id, {
        licensePlate: editForm.licensePlate.trim(),
        type: editForm.type,
        color: editForm.color.trim()
      });
      setEditSuccess('Cập nhật phương tiện thành công.');
      
      // Reload vehicles
      if (selectedApartmentId === 'ALL') {
        const data = await fetchAllVehicles();
        setVehicles(data);
      } else {
        const data = await fetchApartmentVehicles(Number(selectedApartmentId));
        const apt = apartments.find(a => String(a.id) === String(selectedApartmentId));
        setVehicles(data.map(v => ({ ...v, apartmentNumber: apt?.apartmentNumber })));
      }
      
      setTimeout(() => {
        setEditSuccess('');
        setEditVehicle(null);
      }, 1500);
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Lỗi khi cập nhật phương tiện.');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện biển số ${vehicle.licensePlate}?`)) return;
    try {
      await deleteApartmentVehicle(vehicle.apartmentId, vehicle.id);
      // Reload vehicles
      if (selectedApartmentId === 'ALL') {
        const data = await fetchAllVehicles();
        setVehicles(data);
      } else {
        const data = await fetchApartmentVehicles(Number(selectedApartmentId));
        const apt = apartments.find(a => String(a.id) === String(selectedApartmentId));
        setVehicles(data.map(v => ({ ...v, apartmentNumber: apt?.apartmentNumber })));
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa phương tiện.');
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý phương tiện</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem và quản lý các phương tiện xe của cư dân trong chung cư.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {!isResident && apartments.length > 0 && (
            <div className="relative w-full sm:w-64">
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
              >
                <option value="ALL">Tất cả chung cư</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>Căn hộ {a.apartmentNumber}</option>
                ))}
              </select>
            </div>
          )}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 bg-surface pl-10 pr-4 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
              placeholder="Tìm biển số, mã căn..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Thêm phương tiện mới</h3>
          {addError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{addError}</div>}
          {addSuccess && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{addSuccess}</div>}
          
          <form className="grid grid-cols-1 sm:grid-cols-5 gap-4" onSubmit={handleAdd}>
            <div className="sm:col-span-1">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                value={addForm.apartmentId || (selectedApartmentId !== 'ALL' ? selectedApartmentId : '')}
                onChange={(e) => setAddForm({ ...addForm, apartmentId: e.target.value })}
                disabled={selectedApartmentId !== 'ALL' && selectedApartmentId !== ''}
              >
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>Căn hộ {a.apartmentNumber}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="Biển số (*)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                value={addForm.licensePlate}
                onChange={(e) => setAddForm({ ...addForm, licensePlate: e.target.value })}
              />
            </div>
            <div className="sm:col-span-1">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                value={addForm.color}
                onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
              />
            </div>
            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={adding}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:opacity-70"
              >
                {adding ? 'Đang thêm...' : 'Thêm phương tiện'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="text-slate-600">Đang tải danh sách phương tiện...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Căn hộ</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Biển số</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Loại xe</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">Màu sắc</th>
                  {isAdmin && <th className="px-5 py-4 text-right font-semibold text-slate-600">Hành động</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-900">{v.apartmentNumber || '-'}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{v.licensePlate}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {translateType(v.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{v.color || '-'}</td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditVehicle(v);
                            setEditForm({ licensePlate: v.licensePlate, type: v.type, color: v.color || '' });
                            setEditError('');
                            setEditSuccess('');
                          }}
                          className="mr-3 text-blue-500 hover:text-blue-700 transition-colors"
                          title="Sửa phương tiện"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Xóa phương tiện"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={isAdmin ? 5 : 4}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mb-2 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <p className="text-sm font-medium text-slate-900">Không có dữ liệu phương tiện.</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Sửa phương tiện</h2>
              <button
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setEditVehicle(null)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {editError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{editError}</div>}
              {editSuccess && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{editSuccess}</div>}
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Biển số (*)</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                    value={editForm.licensePlate}
                    onChange={(e) => setEditForm({ ...editForm, licensePlate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Loại xe</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="XE_MAY">Xe máy</option>
                    <option value="XE_DAP_DIEN">Xe đạp điện</option>
                    <option value="O_TO">Ô tô</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Màu sắc</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditVehicle(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 disabled:opacity-70"
                  >
                    {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
