import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { fetchAllFeedbacks, fetchFeedbacksByApartment, createFeedback, replyFeedback } from '../../api/feedbackApi.js';
import { fetchApartments } from '../../api/apartmentsApi.js';
import Modal from '../../components/common/Modal.jsx';

export default function FeedbackPage() {
  const { auth } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState('');
  const [formError, setFormError] = useState('');

  const isResident = auth?.role === 'RESIDENT';
  const canReply = auth?.role === 'ADMIN' || auth?.role === 'MANAGER';

  useEffect(() => {
    loadInitialData();
  }, [auth]);

  async function loadInitialData() {
    setLoading(true);
    setError('');
    try {
      if (isResident) {
        // Resident only sees their own assigned apartment (mocked to 1)
        const apps = await fetchApartments();
        setApartments(apps);
        if (apps.length > 0) {
          const aptId = apps[0].id;
          setSelectedApartmentId(aptId.toString());
          const fb = await fetchFeedbacksByApartment(aptId);
          setFeedbacks(fb);
        }
      } else {
        // Admin/Manager can fetch all feedbacks directly
        const [fb, apps] = await Promise.all([fetchAllFeedbacks(), fetchApartments()]);
        setFeedbacks(fb);
        setApartments(apps);
      }
    } catch (e) {
      setError('Lỗi khi tải dữ liệu góp ý.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadFeedbacks(aptId) {
    if (!aptId) return;
    try {
      const fb = await fetchFeedbacksByApartment(aptId);
      setFeedbacks(fb);
    } catch (e) {
      setError('Lỗi khi tải dữ liệu góp ý căn hộ.');
    }
  }

  const handleApartmentChange = (e) => {
    const val = e.target.value;
    setSelectedApartmentId(val);
    if (val === '') {
      // If admin selects "Tất cả", load all
      if (!isResident) {
        fetchAllFeedbacks().then(setFeedbacks).catch(() => setError('Lỗi khi tải dữ liệu.'));
      }
    } else {
      loadFeedbacks(val);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!createForm.title.trim() || !createForm.content.trim()) {
      setFormError('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }
    try {
      await createFeedback({
        apartmentId: Number(selectedApartmentId),
        title: createForm.title.trim(),
        content: createForm.content.trim()
      });
      setIsCreateModalOpen(false);
      setCreateForm({ title: '', content: '' });
      loadFeedbacks(selectedApartmentId);
    } catch (e) {
      setFormError('Lỗi khi gửi góp ý.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!replyContent.trim()) {
      setFormError('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    try {
      await replyFeedback(currentFeedback.id, replyContent.trim());
      setIsReplyModalOpen(false);
      setReplyContent('');
      if (selectedApartmentId) {
        loadFeedbacks(selectedApartmentId);
      } else {
        fetchAllFeedbacks().then(setFeedbacks);
      }
    } catch (e) {
      setFormError('Lỗi khi gửi phản hồi.');
    }
  };

  const openReplyModal = (fb) => {
    setCurrentFeedback(fb);
    setReplyContent(fb.reply || '');
    setIsReplyModalOpen(true);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center animate-fade-in-up">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
    </div>
  );

  return (
    <div className="animate-fade-in-up space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ý kiến đóng góp</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isResident ? 'Gửi phản ánh, góp ý tới Ban quản lý chung cư.' : 'Quản lý và phản hồi ý kiến từ cư dân.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isResident && (
            <select
              value={selectedApartmentId}
              onChange={handleApartmentChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Tất cả căn hộ</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apartmentNumber}
                </option>
              ))}
            </select>
          )}

          {isResident && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md active:bg-primary-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Gửi ý kiến mới
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {feedbacks.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
            <p className="text-sm text-slate-500">Chưa có ý kiến đóng góp nào.</p>
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-slate-500 mb-1">
                    Căn hộ {fb.apartmentNumber}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{fb.title}</h3>
                </div>
                {fb.status === 'REPLIED' ? (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Đã phản hồi
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    Đang chờ
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
                {fb.content}
              </p>
              
              <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                </div>
                {canReply ? (
                  <button
                    onClick={() => openReplyModal(fb)}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {fb.status === 'REPLIED' ? 'Sửa phản hồi' : 'Trả lời'}
                  </button>
                ) : (
                  fb.status === 'REPLIED' && (
                    <button
                      onClick={() => openReplyModal(fb)} // For resident, it just views
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Xem phản hồi
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal (Resident) */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Gửi ý kiến đóng góp">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && <div className="text-sm text-red-600 font-medium">{formError}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="VD: Phản ánh tiếng ồn..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung chi tiết</label>
            <textarea
              required
              rows={5}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              placeholder="Mô tả chi tiết ý kiến của bạn..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
            >
              Gửi ý kiến
            </button>
          </div>
        </form>
      </Modal>

      {/* Reply Modal (Admin/Manager to reply, Resident to view) */}
      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} title={canReply ? 'Phản hồi ý kiến' : 'Nội dung phản hồi'}>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">{currentFeedback?.title}</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{currentFeedback?.content}</p>
          </div>
          
          <form onSubmit={handleReplySubmit} className="space-y-4">
            {formError && <div className="text-sm text-red-600 font-medium">{formError}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ban quản lý phản hồi</label>
              <textarea
                required={canReply}
                readOnly={!canReply}
                rows={5}
                className={`w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none ${!canReply ? 'bg-slate-50 text-slate-800' : ''}`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={canReply ? "Nhập câu trả lời..." : "Chưa có phản hồi."}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReplyModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              {canReply && (
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
                >
                  Gửi phản hồi
                </button>
              )}
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
