import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  setToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  removeToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Students API
export const studentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getProgress: async (id) => {
    const response = await api.get(`/students/${id}/progress`);
    return response.data;
  },
};

// Subjects API
export const subjectsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/subjects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  update: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};

// Exams API
export const examsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/exams', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  create: async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data;
  },

  update: async (id, examData) => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
};

// Marks API
export const marksAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/marks', { params });
    return response.data;
  },

  getByExam: async (examId) => {
    const response = await api.get(`/marks/exam/${examId}`);
    return response.data;
  },

  create: async (marksData) => {
    const response = await api.post('/marks', marksData);
    return response.data;
  },

  createBulk: async (examId, marksData) => {
    const response = await api.post('/marks/bulk', {
      exam_id: examId,
      marks_data: marksData,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/marks/${id}`);
    return response.data;
  },

  sendNotification: async (id) => {
    const response = await api.post(`/marks/${id}/notify`);
    return response.data;
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 