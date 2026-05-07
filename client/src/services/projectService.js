import api from './api';

const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  getStats: () => api.get('/projects/stats'),
};

export default projectService;
