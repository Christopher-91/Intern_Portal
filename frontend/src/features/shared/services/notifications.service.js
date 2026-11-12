import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/notifications`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotifications = async () => (await api.get('/')).data;
export const getUnreadNotificationCount = async () => (await api.get('/unread-count')).data;
export const markNotificationRead = async (id) => (await api.patch(`/${id}/read`)).data;
export const markAllNotificationsRead = async () => (await api.patch('/read-all')).data;
