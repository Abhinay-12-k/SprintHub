import api from './api';

const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  updateProfile: (data) => api.put('/users/profile', data),
  getById: (id) => api.get(`/users/${id}`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
};

export default userService;
