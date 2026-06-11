import apiClient from './axiosConfig.js';

export async function getAllInvoices() {
  const { data } = await apiClient.get('/invoices');
  return data;
}

export async function getInvoicesByApartment(apartmentId) {
  const { data } = await apiClient.get(`/invoices/apartment/${apartmentId}`);
  return data;
}

export async function getInvoiceById(id) {
  const { data } = await apiClient.get(`/invoices/${id}`);
  return data;
}

export async function updateInvoicePayment(id, paymentId) {
  const { data } = await apiClient.patch(`/invoices/${id}/payment`, null, {
    params: { paymentId },
  });
  return data;
}
