import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { fetchApartments } from '../../api/apartmentsApi.js';
import {
  createNotification,
  deleteNotification,
  getAllNotifications,
  getNotificationsForApartment,
} from '../../api/notificationsApi.js';

export default function NotificationsPage() {
  const { auth } = useAuth();
  const isAdminOrManager = auth?.role === 'ADMIN' || auth?.role === 'CASHIER';

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', type: 'INFO', apartmentId: '' });
  const [createStatus, setCreateStatus] = useState({ submitting: false, error: '', success: '' });

  // 1. Tải danh sách căn hộ (để filter hoặc để admin chọn khi tạo mới)
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const a = await fetchApartments();
        if (cancelled) return;
        setApartments(a);
        if (!isAdminOrManager && a.length > 0) {
          // Resident mặc định lấy id đầu tiên
          setSelectedApartmentId(String(a[0].id));
        }
      } catch (err) {
        if (!cancelled) console.error("Không tải được apartments", err);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [isAdminOrManager]);

  // 2. Tải thông báo
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        let data;
        if (isAdminOrManager) {
          data = await getAllNotifications();
        } else {
          if (!selectedApartmentId) return; // Đợi load xong apartment
          data = await getNotificationsForApartment(Number(selectedApartmentId));
        }
        if (!cancelled) {
          // Sắp xếp giảm dần theo thời gian (nếu backend chưa sort)
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(data);
        }
      } catch (err) {
        if (cancelled) return;
        setError('Không tải được thông báo. Kiểm tra kết nối.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [isAdminOrManager, selectedApartmentId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.content) {
      setCreateStatus({ submitting: false, error: 'Tiêu đề và nội dung là bắt buộc.', success: '' });
      return;
    }
    setCreateStatus({ submitting: true, error: '', success: '' });
    try {
      const payload = {
        title: createForm.title.trim(),
        content: createForm.content.trim(),
        type: createForm.type,
        apartmentId: createForm.apartmentId ? Number(createForm.apartmentId) : null,
      };
      const created = await createNotification(payload);
      setNotifications(prev => [created, ...prev]);
      setCreateStatus({ submitting: false, error: '', success: 'Tạo thông báo thành công!' });
      setCreateForm({ title: '', content: '', type: 'INFO', apartmentId: '' });
    } catch (err) {
      setCreateStatus({ submitting: false, error: 'Lỗi khi tạo thông báo.', success: '' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN');
  };

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo</h1>
          <p className="mt-1 text-sm text-slate-500">Bảng tin và các thông báo gửi đến cư dân.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAdminOrManager && (
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={selectedApartmentId}
              onChange={e => setSelectedApartmentId(e.target.value)}
            >
              <option value="" disabled>-- Chọn căn hộ --</option>
              {apartments.map(a => (
                <option key={a.id} value={a.id}>Căn hộ P.{a.apartmentNumber}</option>
              ))}
            </select>
          )}

          {isAdminOrManager && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
              onClick={() => {
                setCreateStatus({ submitting: false, error: '', success: '' });
                setCreateOpen(!createOpen);
              }}
            >
              Tạo thông báo
            </button>
          )}
        </div>
      </div>

      {createOpen && isAdminOrManager && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Soạn thông báo mới</h2>
          
          {createStatus.error && <div className="mb-4 text-sm text-red-600">{createStatus.error}</div>}
          {createStatus.success && <div className="mb-4 text-sm text-emerald-600">{createStatus.success}</div>}
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={createForm.title}
                  onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại thông báo</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={createForm.type}
                  onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="INFO">Thông tin (Info)</option>
                  <option value="WARNING">Cảnh báo (Warning)</option>
                  <option value="URGENT">Khẩn cấp (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Đối tượng nhận (Bỏ trống = Gửi tất cả)</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={createForm.apartmentId}
                onChange={e => setCreateForm(f => ({ ...f, apartmentId: e.target.value }))}
              >
                <option value="">-- Tất cả cư dân --</option>
                {apartments.map(a => (
                  <option key={a.id} value={a.id}>Căn hộ P.{a.apartmentNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung *</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                value={createForm.content}
                onChange={e => setCreateForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                onClick={() => setCreateOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createStatus.submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Gửi thông báo
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Đang tải thông báo...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
          <p className="text-slate-500">Chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition hover:shadow-md relative">
              {isAdminOrManager && (
                <button
                  onClick={() => handleDelete(n.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-600"
                  title="Xóa thông báo"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${n.type === 'URGENT' ? 'bg-red-100 text-red-700' : 
                    n.type === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
                `}>
                  {n.type === 'URGENT' ? 'Khẩn cấp' : n.type === 'WARNING' ? 'Cảnh báo' : 'Thông tin'}
                </span>
                {n.apartmentId && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Gửi riêng: P.{n.apartmentNumber}
                  </span>
                )}
                {!n.apartmentId && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Thông báo chung
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 pr-8">{n.title}</h3>
              <p className="text-xs text-slate-500 mb-3">
                Đăng lúc: {formatDate(n.createdAt)} {n.senderUsername ? `bởi ${n.senderUsername}` : ''}
              </p>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{n.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
