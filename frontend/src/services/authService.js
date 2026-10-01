import api from './api.js';

export const registerRequest = (payload) => api.post('/auth/register', payload).then((r) => r.data);

export const loginRequest = (payload) => api.post('/auth/login', payload).then((r) => r.data);

export const getMeRequest = () => api.get('/auth/me').then((r) => r.data);

export const updateProfileRequest = (payload) =>
  api.put('/auth/profile', payload).then((r) => r.data);