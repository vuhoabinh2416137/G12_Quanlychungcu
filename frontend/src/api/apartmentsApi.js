import apiClient from './axiosConfig.js';

export async function fetchApartments() {
  const { data } = await apiClient.get('/apartments');
  return data;
}

export async function createApartment(payload) {
  const { data } = await apiClient.post('/apartments', payload);
  return data;
}

export async function updateApartment(id, payload) {
  const { data } = await apiClient.put(`/apartments/${id}`, payload);
  return data;
}

export async function deleteApartment(id) {
  await apiClient.delete(`/apartments/${id}`);
}

export async function updateConsumption(id, payload) {
  const { data } = await apiClient.patch(`/apartments/${id}/consumption`, payload);
  return data;
}

export async function fetchApartmentVehicles(id) {
  const { data } = await apiClient.get(`/apartments/${id}/vehicles`);
  return data.map(v => ({ ...v, apartmentId: id })); // Include apartmentId for cross-apartment display
}

export async function fetchAllVehicles() {
  const apartments = await fetchApartments();
  const results = await Promise.allSettled(
    apartments.map((a) => fetchApartmentVehicles(a.id))
  );
  
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .map(v => {
      const apt = apartments.find(a => a.id === v.apartmentId);
      return { ...v, apartmentNumber: apt?.apartmentNumber };
    });
}

export async function addApartmentVehicle(id, payload) {
  const { data } = await apiClient.post(`/apartments/${id}/vehicles`, payload);
  return data;
}

export async function updateApartmentVehicle(id, vehicleId, payload) {
  const { data } = await apiClient.put(`/apartments/${id}/vehicles/${vehicleId}`, payload);
  return data;
}

export async function deleteApartmentVehicle(id, vehicleId) {
  await apiClient.delete(`/apartments/${id}/vehicles/${vehicleId}`);
}
