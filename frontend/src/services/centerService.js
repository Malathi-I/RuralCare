import api from './api.js';

export const getCenters = (params) =>
  api.get('/healthcare-centers', { params }).then((r) => r.data);

export const getCenterById = (id) =>
  api.get(`/healthcare-centers/${id}`).then((r) => r.data);