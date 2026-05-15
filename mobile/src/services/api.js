import axios from 'axios';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://localhost:3000'        // local dev
  : 'https://api.alexander-ai.com'; // production

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store token reference so it can be updated after login
let currentToken = null;

export function setAuthToken(token) {
  currentToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Request interceptor — inject auth token
api.interceptors.request.use(
  (config) => {
    if (currentToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      const enhanced = new Error(message);
      enhanced.status = error.response.status;
      enhanced.data = error.response.data;
      return Promise.reject(enhanced);
    }
    if (error.request) {
      return Promise.reject(new Error('Network error — check your connection'));
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (email, password, full_name) =>
    api.post('/auth/register', { email, password, full_name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// ── Diagnose ──────────────────────────────────────────────────────────────────
export const diagnoseAPI = {
  /**
   * Submit a diagnosis request.
   * @param {Object} params
   * @param {string} params.description
   * @param {Object|null} params.imageAsset - Expo image picker asset (uri, mimeType, etc.)
   * @param {string} params.deviceType
   * @param {string} params.deviceBrand
   * @param {string[]} params.symptoms
   */
  submit: async ({ description, imageAsset, deviceType, deviceBrand, symptoms }) => {
    const formData = new FormData();
    formData.append('description', description);
    if (deviceType) formData.append('device_type', deviceType);
    if (deviceBrand) formData.append('device_brand', deviceBrand);
    if (symptoms && symptoms.length > 0) formData.append('symptoms', JSON.stringify(symptoms));

    if (imageAsset) {
      const uri = imageAsset.uri;
      const ext = uri.split('.').pop().toLowerCase();
      const mimeType = imageAsset.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      formData.append('image', {
        uri,
        name: `photo.${ext}`,
        type: mimeType,
      });
    }

    return api.post('/diagnose', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // AI calls can be slow
    });
  },
};

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  list: () => api.get('/jobs'),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
};

// ── Technicians ───────────────────────────────────────────────────────────────
export const techniciansAPI = {
  list: () => api.get('/technicians'),
  request: (data) => api.post('/technicians/request', data),
};
