import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  signup: (data) => api.post('/admin/signup', data),
  login: (data) => api.post('/admin/login', data),
  getMe: () => api.get('/admin/me'),
  getAllMembers: () => api.get('/admin/all'),
  updateMember: (id, data) => api.put(`/admin/${id}`, data),
};

export const taskAPI = {
  create: (formData) => api.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/tasks'),
  update: (id, data) => api.put(`/tasks/${id}`, data),
};

export const customerAPI = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  submitInquiry: (formData) => api.post('/customers/inquiry', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addComment: (id, text) => api.post(`/customers/${id}/comment`, { text }),
  forwardInquiry: (id, department, comment, files) => {
    const fd = new FormData();
    fd.append('department', department);
    fd.append('comment', comment);
    if (files) files.forEach(f => fd.append('attachments', f));
    return api.post(`/customers/${id}/forward`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  shareDocument: (id, formData) => api.post(`/customers/${id}/share-document`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const materialAPI = {
  getAll: () => api.get('/materials'),
  add: (data) => api.post('/materials/add', data),
  withdraw: (data) => api.post('/materials/withdraw', data),
};

export const approvalAPI = {
  getAll: () => api.get('/approvals'),
  create: (formData) => api.post('/approvals', formData),
  updateStatus: (id, status, approvedBy) => api.put(`/approvals/${id}/status`, { status, approvedBy }),
  addComment: (id, text, authorName) => api.post(`/approvals/${id}/comment`, { text, authorName }),
  delete: (id) => api.delete(`/approvals/${id}`),
};

export default api;
