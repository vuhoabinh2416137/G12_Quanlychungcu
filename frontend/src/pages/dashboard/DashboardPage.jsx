import React, { useEffect, useMemo, useState } from 'react';
import { fetchApartments } from '../../api/apartmentsApi.js';
import { fetchResidents } from '../../api/residentsApi.js';
import { fetchFees } from '../../api/feesApi.js';
import { useAuth } from '../../hooks/useAuth.js';

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-floating border border-slate-100">
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 group-hover:bg-primary-500"></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { auth } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      setWarnings([]);
      try {
        const results = await Promise.allSettled([fetchApartments(), fetchResidents(), fetchFees()]);
        const [aRes, rRes, fRes] = results;

        if (cancelled) return;

        if (aRes.status === 'fulfilled') setApartments(aRes.value);
        else throw aRes.reason;

        if (rRes.status === 'fulfilled') setResidents(rRes.value);
        else {
          const status = rRes.reason?.response?.status;
          if (status === 403) setWarnings((w) => [...w, 'Bạn không có quyền xem danh sách cư dân (cần ADMIN/MANAGER).']);
          else setWarnings((w) => [...w, 'Không tải được dữ liệu cư dân.']);
          setResidents([]);
        }

        if (fRes.status === 'fulfilled') setFees(fRes.value);
        else {
          setWarnings((w) => [...w, 'Không tải được dữ liệu khoản phí.']);
          setFees([]);
        }
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) setError('401 Unauthorized: hãy đăng xuất và đăng nhập lại.');
        else setError('Không tải được dữ liệu Dashboard. Kiểm tra backend và đăng nhập.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const unpaidFees = useMemo(() => fees.filter((x) => x && x.paid === false), [fees]);

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 animate-fade-in-up">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
      <div className="text-sm font-medium text-slate-500">Đang tải dữ liệu tổng quan...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-600 shadow-sm animate-fade-in-up">
      <svg className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium">{error}</span>
    </div>
  );

  return (
    <div className="animate-fade-in-up space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Tóm tắt tình hình quản lý và tài chính của chung cư.</p>
      </div>

      {warnings.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Cảnh báo hệ thống
          </div>
          <ul className="list-inside list-disc space-y-1 text-amber-700">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {(!auth || auth.role !== 'RESIDENT') && (
          <StatCard 
            label="Tổng căn hộ" 
            value={apartments.length} 
            colorClass="bg-blue-50 text-blue-600"
            icon={<svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />
        )}
        <StatCard 
          label="Tổng cư dân" 
          value={residents.length} 
          colorClass="bg-emerald-50 text-emerald-600"
          icon={<svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          label="Tổng khoản phí" 
          value={fees.length} 
          colorClass="bg-purple-50 text-purple-600"
          icon={<svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
        />
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Phí chưa thanh toán</h2>
            <p className="mt-0.5 text-sm text-slate-500">Danh sách các khoản phí đang nợ</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
            {unpaidFees.length} mục
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Mã căn hộ</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Tên phí</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Số tiền (VNĐ)</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Hạn chót</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidFees.map((fee) => (
                <tr key={fee.id} className="transition-colors hover:bg-slate-50/70 group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {apartments.find(a => String(a.id) === String(fee.apartmentId))?.apartmentNumber || fee.apartmentId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{fee.name}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">{Number(fee.amount).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="text-red-600 font-medium">{fee.dueDate}</span>
                  </td>
                </tr>
              ))}
              {!unpaidFees.length ? (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-500" colSpan={4}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-10 w-10 text-emerald-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-900">Tuyệt vời!</p>
                      <p className="text-xs text-slate-500 mt-1">Tất cả các khoản phí đã được thanh toán.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
