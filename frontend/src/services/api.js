import axios from 'axios';

/**
 * Central API client.
 * The base URL always comes from the VITE_API_URL environment variable,
 * it is never hard-coded in a component.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request when the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turn backend errors into a simple readable message for the UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage = 'Cannot reach the server. Please check your connection.';
    } else {
      error.userMessage =
        error.response.data?.message || 'Something went wrong. Please try again.';
    }
    return Promise.reject(error);
  }
);

export default api;