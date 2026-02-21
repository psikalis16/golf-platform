import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.includes('localhost')) {
    return envUrl.replace('localhost', window.location.hostname);
  }
  return envUrl ?? `http://${window.location.hostname}:8000/api`;
};

// Base API client — reads backend URL from Vite env
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the stored Sanctum token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Public endpoints ────────────────────────────────────────────────────────

export const fetchTenant = () => api.get('/tenant');

export const fetchTeeTimesForDate = (date: string) =>
  api.get('/tee-times', { params: { date } });

export const fetchClosuresForMonth = (year: number, month: number) =>
  api.get('/closures', { params: { year, month } });

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const register = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const logout = () => api.post('/auth/logout');

export const fetchMe = () => api.get('/auth/me');

export const changePassword = (data: {
  password: string;
  password_confirmation: string;
}) => api.post('/auth/change-password', data);


// ─── Golfer booking endpoints ─────────────────────────────────────────────────

export const createBooking = (data: {
  tee_time_slot_id: number;
  players: number;
  cart_requested?: boolean;
  notes?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}) => api.post('/bookings', data);

export const fetchMyBookings = () => api.get('/bookings/my');

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const adminFetchCourse = () => api.get('/admin/course');
export const adminUpdateCourse = (data: object) => api.put('/admin/course', data);
export const adminUpdateSettings = (data: object) => api.put('/admin/settings', data);

export const adminFetchTeeTimes = (startDate: string, endDate: string) =>
  api.get('/admin/tee-times', { params: { start_date: startDate, end_date: endDate } });

export const adminCreateTeeTime = (data: object) => api.post('/admin/tee-times', data);
export const adminBulkCreateTeeTimes = (data: object) => api.post('/admin/tee-times/bulk', data);
export const adminUpdateTeeTime = (id: number, data: object) => api.put(`/admin/tee-times/${id}`, data);
export const adminDeleteTeeTime = (id: number) => api.delete(`/admin/tee-times/${id}`);

export const adminFetchBookings = (params?: object) => api.get('/admin/bookings', { params });
export const adminUpdateBooking = (id: number, data: object) => api.put(`/admin/bookings/${id}`, data);

export const adminFetchClosures = () => api.get('/admin/closures');
export const adminCreateClosure = (data: { date: string; reason?: string }) =>
  api.post('/admin/closures', data);
export const adminDeleteClosure = (id: number) => api.delete(`/admin/closures/${id}`);

export const adminFetchPricing = () => api.get('/admin/pricing');
export const adminCreatePricing = (data: object) => api.post('/admin/pricing', data);
export const adminUpdatePricing = (id: number, data: object) => api.put(`/admin/pricing/${id}`, data);
export const adminDeletePricing = (id: number) => api.delete(`/admin/pricing/${id}`);

export default api;
