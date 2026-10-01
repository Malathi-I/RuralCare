import api from './api.js';

// Patient
export const bookAppointment = (payload) =>
  api.post('/appointments', payload).then((r) => r.data);

export const getMyAppointments = (params) =>
  api.get('/appointments/my', { params }).then((r) => r.data);

export const cancelAppointment = (id) =>
  api.patch(`/appointments/${id}/cancel`).then((r) => r.data);

// Doctor
export const getDoctorAppointments = (params) =>
  api.get('/appointments/doctor', { params }).then((r) => r.data);

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data);