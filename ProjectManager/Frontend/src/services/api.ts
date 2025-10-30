import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const projectsApi = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (project: { title: string; description: string }) => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/projects/${id}`);
  },
};

export const tasksApi = {
  create: async (projectId: string, task: { title: string; description: string; dueDate: string; assignedToUserId?: string }) => {
    const response = await api.post(`/projects/${projectId}/tasks`, task);
    return response.data;
  },
  update: async (taskId: string, task: { title: string; description: string; status: string; dueDate: string; assignedToUserId?: string }) => {
    await api.put(`/tasks/${taskId}`, task);
  },
  delete: async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
  },
};

export default api;