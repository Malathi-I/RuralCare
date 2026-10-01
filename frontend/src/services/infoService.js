import api from './api.js';

export const getInformation = (params) =>
  api.get('/health-information', { params }).then((r) => r.data);

export const getInformationById = (id) =>
  api.get(`/health-information/${id}`).then((r) => r.data);