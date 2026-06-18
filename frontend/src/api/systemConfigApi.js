import apiClient from './axiosConfig.js';

export async function fetchFeeConfigs() {
  const { data } = await apiClient.get('/system-config/fees');
  return data;
}

export async function updateFeeConfigs(configs) {
  const { data } = await apiClient.put('/system-config/fees', configs);
  return data;
}
