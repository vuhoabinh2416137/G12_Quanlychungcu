import apiClient from './axiosConfig.js';
import { fetchApartments } from './apartmentsApi.js';

export async function fetchFeesByApartment(apartmentId) {
  const { data } = await apiClient.get(`/fees/apartment/${apartmentId}`);
  return data;
}

// Used by Dashboard (best-effort): aggregate fees across apartments
export async function fetchFees() {
  const apartments = await fetchApartments();
  const results = await Promise.allSettled(
    apartments.map((a) => fetchFeesByApartment(a.id)),
  );
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

export async function createFeeForApartment(apartmentId, payload) {
  const { data } = await apiClient.post(`/fees/apartment/${apartmentId}`, payload);
  return data;
}

export const createFeeForAllApartments = async (feeData) => {
  const response = await apiClient.post('/fees/all-apartments', feeData);
  return response.data;
};

export async function updateFeePaidStatus(id, paid) {
  const { data } = await apiClient.patch(`/fees/${id}/status`, null, {
    params: { paid },
  });
  return data;
}
