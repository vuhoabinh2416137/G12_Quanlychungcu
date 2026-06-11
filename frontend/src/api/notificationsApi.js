import apiClient from './axiosConfig.js';

export async function createNotification(payload) {
  const { data } = await apiClient.post('/notifications', payload);
  return data;
}

export async function getAllNotifications() {
  const { data } = await apiClient.get('/notifications');
  return data;
}

export async function getNotificationsForApartment(apartmentId) {
  const { data } = await apiClient.get(`/notifications/apartment/${apartmentId}`);
  return data;
}

export async function getNotificationById(id) {
  const { data } = await apiClient.get(`/notifications/${id}`);
  return data;
}

export async function deleteNotification(id) {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
}
