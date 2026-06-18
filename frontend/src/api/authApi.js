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

export async function registerUser(payload) {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await client.post('/auth/register', payload);
  return data;
}

export async function checkResidentForAuth(phone) {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await client.get(`/auth/check-resident?phone=${phone}`);
  return data;
}
