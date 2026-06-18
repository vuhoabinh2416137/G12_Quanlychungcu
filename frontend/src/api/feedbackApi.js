import apiClient from './axiosConfig.js';

export async function fetchAllFeedbacks() {
  const { data } = await apiClient.get('/feedbacks');
  return data;
}

export async function fetchFeedbacksByApartment(apartmentId) {
  const { data } = await apiClient.get(`/feedbacks/apartment/${apartmentId}`);
  return data;
}

export async function createFeedback(payload) {
  const { data } = await apiClient.post('/feedbacks', payload);
  return data;
}

export async function replyFeedback(id, replyContent) {
  const { data } = await apiClient.put(`/feedbacks/${id}/reply`, { reply: replyContent });
  return data;
}
