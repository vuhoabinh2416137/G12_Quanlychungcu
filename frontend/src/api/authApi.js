import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl.js';

export async function loginWithJwt(payload) {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await client.post('/auth/login', payload);
  return data;
}
