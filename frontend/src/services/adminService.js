import api from './api.js';

export const getStats = () => api.get('/admin/stats').then((r) => r.data);

export const getUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);

export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data);

export const getAdminAppointments = (params) =>
  api.get('/admin/appointments', { params }).then((r) => r.data);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data);

export const getAdminDoctors = () => api.get('/admin/doctors').then((r) => r.data);

export const createDoctor = (payload) =>
  api.post('/admin/doctors', payload).then((r) => r.data);

export const updateDoctor = (id, payload) =>
  api.put(`/admin/doctors/${id}`, payload).then((r) => r.data);

export const deleteDoctor = (id) => api.delete(`/admin/doctors/${id}`).then((r) => r.data);

export const createCenter = (payload) =>
  api.post('/admin/healthcare-centers', payload).then((r) => r.data);

export const updateCenter = (id, payload) =>
  api.put(`/admin/healthcare-centers/${id}`, payload).then((r) => r.data);

export const deleteCenter = (id) =>
  api.delete(`/admin/healthcare-centers/${id}`).then((r) => r.data);

export const createInformation = (payload) =>
  api.post('/admin/health-information', payload).then((r) => r.data);

export const updateInformation = (id, payload) =>
  api.put(`/admin/health-information/${id}`, payload).then((r) => r.data);

export const deleteInformation = (id) =>
  api.delete(`/admin/health-information/${id}`).then((r) => r.data);