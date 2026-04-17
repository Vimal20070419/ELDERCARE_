// services/api.js — Axios instance with interceptors + all API call functions
import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updatePrefs: (data) => api.put('/auth/prefs', data),
  requestOTP:(phone) => api.post('/auth/otp/request', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/otp/verify', { phone, otp }),
};

// ── Patients ──
export const patientAPI = {
  create:    (data) => api.post('/patients', data),
  list:      ()     => api.get('/patients'),
  listAll:   ()     => api.get('/patients/all'),
  getById:   (id)   => api.get(`/patients/${id}`),
  getProfile:()     => api.get('/patients/profile'),
  update:    (id, data) => api.put(`/patients/${id}`, data),
  getAIInsights: (id)   => api.get(`/patients/${id}/ai-insights`),
};

// ── Medications ──
export const medicationAPI = {
  add:          (data)              => api.post('/medications', data),
  getByPatient: (patientId, status) => api.get(`/medications/patient/${patientId}`, { params: { status } }),
  getClinicalInfo: (medId)          => api.get(`/medications/${medId}/clinical`),
  updateStatus: (id, status)        => api.put(`/medications/${id}/status`, { status }),
  delete:       (id)                => api.delete(`/medications/${id}`),
};

// ── Adherence ──
export const adherenceAPI = {
  checkIn:         (data)      => api.post('/adherence/checkin', data),
  getWeeklyStats:  (patientId) => api.get(`/adherence/patient/${patientId}/weekly`),
  getMissedPatterns:(patientId)=> api.get(`/adherence/patient/${patientId}/patterns`),
  getRecentLogs:   (patientId) => api.get(`/adherence/patient/${patientId}/logs`),
};

// ── Interactions ──
export const interactionAPI = {
  getByPatient: (patientId) => api.get(`/interactions/patient/${patientId}`),
  acknowledge:  (id)        => api.put(`/interactions/${id}/acknowledge`),
};

// ── Notifications ──
export const notificationAPI = {
  getUnread:   (patientId) => api.get('/notifications/unread', { params: { patientId } }),
  markRead:    (id)        => api.put(`/notifications/${id}/read`),
  markAllRead: (patientId) => api.post('/notifications/mark-all-read', { patientId }),
};

// ── Reports ──
export const reportAPI = {
  getWeekly: (patientId) => api.get(`/v1/physician-report/${patientId}`),
};

// ── OCR Auto-Injector ──
export const ocrAPI = {
  // Extending timeout here significantly to 60s since multimodal LLM calls can take 15-20s.
  scan: (formData, dryRun = true) => api.post(`extensions/ocr/upload?dryRun=${dryRun}`, formData, { timeout: 60000 })
};

export default api;
