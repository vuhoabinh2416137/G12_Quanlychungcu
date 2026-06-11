import apiClient from './axiosConfig.js';

export async function fetchUsers() {
  const { data } = await apiClient.get('/users');
  return data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users', payload);
  return data;
}

export async function updateUserRole(userId, role) {
  const { data } = await apiClient.patch(`/users/${userId}/role`, { role });
  return data;
}

export async function updateUserActive(userId, active) {
  const { data } = await apiClient.patch(`/users/${userId}/active`, { active });
  return data;
}

export async function fetchMyProfile() {
  const { data } = await apiClient.get('/users/me');
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await apiClient.put('/users/me', payload);
  return data;
}

export async function changeMyPassword(payload) {
  await apiClient.patch('/users/me/password', payload);
}
