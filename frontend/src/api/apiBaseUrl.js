export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
}

export function isMockApi(baseUrl = getApiBaseUrl()) {
  return String(baseUrl).includes('localhost:3001');
}

