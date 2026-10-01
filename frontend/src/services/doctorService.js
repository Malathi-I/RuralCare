import api from './api.js';

// Public endpoints
export const getDoctors = (params) => api.get('/doctors', { params }).then((r) => r.data);

export const getDoctorById = (id) => api.get(`/doctors/${id}`).then((r) => r.data);

// Doctor-only endpoints
export const getMyDoctorProfile = () => api.get('/doctors/me').then((r) => r.data);

export const updateMyAvailability = (payload) =>
  api.put('/doctors/me/availability', payload).then((r) => r.data);