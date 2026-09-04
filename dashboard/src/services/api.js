import axios from 'axios';

/**
 * Single axios instance for the whole app. Why centralize this:
 * - one place to set the backend base URL
 * - one place to attach the JWT to every request (instead of every
 *   component remembering to do it)
 * - one place to react to a 401 (expired/invalid token) globally
 *
 * Deliberately NOT using .env for the base URL in this project — the
 * backend port (5000) is fixed and documented throughout the existing
 * project's stages, so a hardcoded constant here is simpler and matches
 * "don't over-engineer" from the project's own rules. If this ever needs
 * to point at a different backend, this is the one line to change.
 */
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever returns 401 (expired/invalid token), clear the
// stale session and send the user back to Login — rather than letting
// the app sit in a broken "logged in but every request fails" state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;