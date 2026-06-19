import axiosInstance from './axiosConfig.js';
import { isMockApi } from './apiBaseUrl.js';

export async function createPayment(feeId, payload) {
  if (isMockApi()) {
    console.log('[MOCK] createPayment', feeId, payload);
    return { id: Date.now(), feeId, ...payload, status: 'PENDING' };
  }
  const response = await axiosInstance.post(`/payments/fee/${feeId}`, payload);
  return response.data;
}

export async function fetchPendingPayments() {
  if (isMockApi()) {
    return [
      { id: 1, feeId: 10, feeName: 'Mock Fee', amount: 500000, status: 'PENDING', apartmentNumber: 'A101', method: 'QR', paymentDate: new Date().toISOString() }
    ];
  }
  const response = await axiosInstance.get('/cashier/payments/pending');
  return response.data;
}

export async function confirmPayment(paymentId, actualAmount) {
  if (isMockApi()) {
    console.log('[MOCK] confirmPayment', paymentId, actualAmount);
    return { id: paymentId, status: 'COMPLETED', amount: actualAmount };
  }
  const response = await axiosInstance.post(`/cashier/payments/${paymentId}/confirm`, { actualAmount });
  return response.data;
}

export async function fetchPaymentHistoryByApartment(apartmentId, isResident = false) {
  if (isMockApi()) {
    console.log('[MOCK] fetchPaymentHistoryByApartment', apartmentId);
    return [];
  }
  const path = isResident ? `/payments/apartment/${apartmentId}/history/my` : `/payments/apartment/${apartmentId}/history`;
  const response = await axiosInstance.get(path);
  return response.data;
}

export async function submitRefundInfo(paymentId, bankName, accountNumber, accountName) {
  if (isMockApi()) {
    console.log('[MOCK] submitRefundInfo', paymentId, bankName, accountNumber, accountName);
    return { id: paymentId, refundStatus: 'PENDING_REFUND' };
  }
  const response = await axiosInstance.post(`/payments/${paymentId}/refund-info`, {
    bankName,
    accountNumber,
    accountName
  });
  return response.data;
}

export async function fetchRefunds() {
  if (isMockApi()) {
    console.log('[MOCK] fetchRefunds');
    return [];
  }
  const response = await axiosInstance.get('/payments/refunds');
  return response.data;
}

export async function confirmRefund(paymentId) {
  if (isMockApi()) {
    console.log('[MOCK] confirmRefund', paymentId);
    return { id: paymentId, refundStatus: 'COMPLETED' };
  }
  const response = await axiosInstance.post(`/payments/${paymentId}/confirm-refund`);
  return response.data;
}

export async function reRequestRefundInfo(paymentId) {
  if (isMockApi()) {
    console.log('[MOCK] reRequestRefundInfo', paymentId);
    return { id: paymentId, refundStatus: 'PENDING_INFO' };
  }
  const response = await axiosInstance.post(`/payments/${paymentId}/re-request-refund`);
  return response.data;
}

export async function fetchLastRefundInfo(paymentId) {
  if (isMockApi()) {
    console.log('[MOCK] fetchLastRefundInfo', paymentId);
    return null;
  }
  const response = await axiosInstance.get(`/payments/${paymentId}/last-refund-info`);
  if (response.status === 204) return null;
  return response.data;
}
