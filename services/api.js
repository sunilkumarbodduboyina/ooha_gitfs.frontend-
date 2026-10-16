// API service placeholder
// This file provides stub API functions until the actual backend is connected

import axios from 'axios';

const baseURL = '/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ooha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const api = {
  // Auth
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),

  // Cart
  cart: () => client.get('/cart').then((r) => r.data),
  addToCart: (productId, quantity) => client.post('/cart', { productId, quantity }).then((r) => r.data),
  updateCart: (itemId, quantity) => client.put(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  removeFromCart: (itemId) => client.delete(`/cart/${itemId}`).then((r) => r.data),

  // Wishlist
  wishlist: () => client.get('/wishlist').then((r) => r.data),
  addToWishlist: (productId) => client.post('/wishlist', { productId }).then((r) => r.data),
  removeFromWishlist: (productId) => client.delete(`/wishlist/${productId}`).then((r) => r.data),

  // Products
  products: (params) => client.get('/products', { params }).then((r) => r.data),
  product: (id) => client.get(`/products/${id}`).then((r) => r.data),

  // Orders
  orders: () => client.get('/orders').then((r) => r.data),
  order: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  createOrder: (data) => client.post('/orders', data).then((r) => r.data),

  // Admin
  adminProducts: () => client.get('/admin/products').then((r) => r.data),
  adminCreateProduct: (data) => client.post('/admin/products', data).then((r) => r.data),
  adminUpdateProduct: (id, data) => client.put(`/admin/products/${id}`, data).then((r) => r.data),
  adminDeleteProduct: (id) => client.delete(`/admin/products/${id}`).then((r) => r.data),
  adminOrders: () => client.get('/admin/orders').then((r) => r.data),
  adminUpdateOrder: (id, data) => client.put(`/admin/orders/${id}`, data).then((r) => r.data),
};

// Helper functions
export const img = (path) => {
  if (!path) return '/images/placeholder.svg';
  if (path.startsWith('http')) return path;
  return `/uploads/${path}`;
};

export const inr = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default api;
