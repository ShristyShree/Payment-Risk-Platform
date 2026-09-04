import api from './api';

/**
 * Thin wrappers around the real endpoints (Stage 4 of the backend).
 * Deliberately no logic here beyond the HTTP call itself — matching
 * request/response shapes exactly as confirmed from the backend code:
 *   POST /api/auth/login -> { token, user: { id, name, email, role } }
 */

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { token, user }
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data; // { token, user }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data; // { user }
}