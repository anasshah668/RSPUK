import { API_BASE_URL } from '../config/apiConfig.js';
import apiRequest from '../utils/api.js';

// Auth APIs
export const authApi = {
  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// Products (public)
export const productsApi = {
  listHome: (limit = 8) =>
    apiRequest(`/products?limit=${limit}`),
};

// Admin APIs
export const adminApi = {
  analytics: () => apiRequest('/admin/analytics'),
  products: {
    list: () => apiRequest('/products'),
    add: async (payload, files = []) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      files.forEach((file) => formData.append('images', file));

      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add product');
      }
      return data;
    },
  },
  orders: {
    list: () => apiRequest('/admin/orders'),
    updateStatus: (orderId, status) =>
      apiRequest(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },
  quotes: {
    list: () => apiRequest('/quotes'),
    update: (id, payload) =>
      apiRequest(`/quotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },
};

