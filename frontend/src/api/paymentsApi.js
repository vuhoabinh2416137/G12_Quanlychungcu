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
