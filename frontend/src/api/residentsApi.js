import apiClient from './axiosConfig.js';

export async function fetchResidents() {
  const { data } = await apiClient.get('/residents');
  return data;
}

export async function createResident(apartmentId, payload) {
  const { data } = await apiClient.post(`/residents/apartment/${apartmentId}`, payload);
  return data;
}

export async function updateResident(id, payload) {
  const { data } = await apiClient.put(`/residents/${id}`, payload);
  return data;
}

export async function deleteResident(id) {
  await apiClient.delete(`/residents/${id}`);
}

export async function getResidentByPhone(phone) {
  const { data } = await apiClient.get(`/residents/phone/${phone}`);
  return data;
}
