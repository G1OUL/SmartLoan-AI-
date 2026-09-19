import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartloan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),

  // Prediction & Applications
  predictApproval: (data) => apiClient.post('/predict/approval', data),
  submitApplication: (data) => apiClient.post('/applications', data),
  getMyApplications: () => apiClient.get('/applications/my'),
  getApplicationById: (id) => apiClient.get(`/applications/${id}`),
  getPdfReportUrl: (id) => `${API_BASE_URL}/applications/${id}/report`,

  // Calculator
  calculateCosts: (data) => apiClient.post('/calculator/cost-breakdown', data),

  // Banks
  getBanks: (category) => apiClient.get('/banks', { params: { category } }),
  getBankById: (id) => apiClient.get(`/banks/${id}`),

  // Documents
  getDocumentChecklist: (params) => apiClient.get('/documents/checklist', { params }),
  uploadDocument: (formData) => apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyDocuments: (params) => apiClient.get('/documents/my', { params }),

  // Admin
  getAdminAnalytics: () => apiClient.get('/admin/analytics'),
  getAllApplications: () => apiClient.get('/admin/applications'),
  updateApplicationStatus: (id, status) => apiClient.patch(`/admin/applications/${id}/status`, { status }),
  addBankProduct: (data) => apiClient.post('/admin/banks', data),
  deleteBankProduct: (id) => apiClient.delete(`/admin/banks/${id}`),

  // AI Chat
  sendChatMessage: (message) => apiClient.post('/chat/advisor', { message }),
};

export default api;
