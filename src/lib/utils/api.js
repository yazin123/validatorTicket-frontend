// lib/utils/api.js
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/v1'

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
}

// Tickets API
export const ticketsAPI = {
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  verifyTicket: (ticketId) => api.post('/tickets/verify', { ticketId }),
  verifyEventTickets: (eventId) => api.post('/tickets/verify-event', { eventId }),
  cancelTicket: (ticketId) => api.post('/tickets/cancel', { ticketId }),
}


// Payment API
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: () => api.get('/admin/reports'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
}

export default api