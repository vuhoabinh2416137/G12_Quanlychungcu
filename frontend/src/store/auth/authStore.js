import { readJson, remove, writeJson } from '../../utils/storage.js';

const AUTH_KEY = 'bluemoon_auth_v1';

export function getAuth() {
  return readJson(AUTH_KEY, null);
}

export function setAuth(auth) {
  writeJson(AUTH_KEY, auth);
}

export function clearAuth() {
  remove(AUTH_KEY);
}
