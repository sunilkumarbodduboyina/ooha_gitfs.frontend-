import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ooha_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => {
    /* Revalidate-on-return caching: when the backend answers a conditional
       GET with 304, replay the last successful body for that request. */
    if (res.status === 304) {
      const key = client.getUri({ url: res.config.url, params: res.config.params });
      res.data = bodyCache.get(key) ?? {};
    } else if (res.config?.method === 'get' && res.data) {
      const key = client.getUri({ url: res.config.url, params: res.config.params });
      bodyCache.set(key, res.data);
      if (bodyCache.size > 100) bodyCache.delete(bodyCache.keys().next().value);
    }
    return res;
  },
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Network error';
    if (err.response?.status === 401 && localStorage.getItem('ooha_token')) {
      localStorage.removeItem('ooha_token');
      localStorage.removeItem('ooha_user');
      if (!window.location.pathname.startsWith('/admin')) window.location.href = '/login';
    }
    return Promise.reject(new Error(msg));
  }
);

/* Accept 304 (conditional GET) as a successful response. */
client.defaults.validateStatus = (status) => (status >= 200 && status < 300) || status === 304;
const bodyCache = new Map();

/* ---------------- helpers ---------------- */

/** Resolve an image path from DB to a usable URL. */
export function img(path) {
  if (!path) return '/images/placeholder.svg';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`;
  return `/${path.replace(/^\//, '')}`;
}

export function inr(v) {
  const n = Number(v) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDate(v) {
  if (!v) return '';
  return new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function orderStatusKey(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, '-');
}

const q = (params) => ({ params });

/* ---------------- API ---------------- */

export const api = {
  /* auth */
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  adminLogin: (data) => client.post('/auth/admin/login', data).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => client.put('/auth/profile', data).then((r) => r.data),
  changePassword: (data) => client.put('/auth/password', data).then((r) => r.data),

  /* catalog */
  home: () => client.get('/home').then((r) => r.data),
  products: (params) => client.get('/products', q(params)).then((r) => r.data),
  product: (id) => client.get(`/products/${id}`).then((r) => r.data),
  search: (term) => client.get('/search', q({ q: term })).then((r) => r.data),
  categories: () => client.get('/categories').then((r) => r.data),
  collections: (type) => client.get('/collections', q({ type })).then((r) => r.data),

  /* admin products */
  createProduct: (form) => client.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateProduct: (id, form) => client.put(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteProduct: (id) => client.delete(`/products/${id}`).then((r) => r.data),
  duplicateProduct: (id) => client.post(`/products/${id}/duplicate`).then((r) => r.data),
  saveCategory: (data) => (data.id ? client.put(`/categories/${data.id}`, data) : client.post('/categories', data)).then((r) => r.data),
  deleteCategory: (id) => client.delete(`/categories/${id}`).then((r) => r.data),
  saveCollection: (data) => (data.id ? client.put(`/collections/${data.id}`, data) : client.post('/collections', data)).then((r) => r.data),
  deleteCollection: (id) => client.delete(`/collections/${id}`).then((r) => r.data),

  /* cart */
  cart: () => client.get('/cart').then((r) => r.data),
  addToCart: (product_id, quantity = 1) => client.post('/cart', { product_id, quantity }).then((r) => r.data),
  updateCart: (id, quantity) => client.put(`/cart/${id}`, { quantity }).then((r) => r.data),
  removeCart: (id) => client.delete(`/cart/${id}`).then((r) => r.data),
  clearCart: () => client.delete('/cart').then((r) => r.data),

  /* wishlist */
  wishlist: () => client.get('/wishlist').then((r) => r.data),
  toggleWishlist: (product_id) => client.post('/wishlist', { product_id }).then((r) => r.data),

  /* orders */
  createOrder: (data) => client.post('/orders', data).then((r) => r.data),
  orders: (params) => client.get('/orders', q(params)).then((r) => r.data),
  order: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  adminOrders: (params) => client.get('/admin/orders', q(params)).then((r) => r.data),
  adminUpdateOrder: (id, data) => client.put(`/admin/orders/${id}`, data).then((r) => r.data),

  /* payments */
  createPayment: (order_id) => client.post('/payments/create-order', { order_id }).then((r) => r.data),
  verifyPayment: (data) => client.post('/payments/verify', data).then((r) => r.data),

  /* reviews */
  reviews: (params) => client.get('/reviews', q(params)).then((r) => r.data),
  postReview: (data) => client.post('/reviews', data).then((r) => r.data),
  updateReview: (id, data) => client.put(`/reviews/${id}`, data).then((r) => r.data),
  deleteReview: (id) => client.delete(`/reviews/${id}`).then((r) => r.data),

  /* content */
  banners: () => client.get('/banners').then((r) => r.data),
  videos: () => client.get('/videos').then((r) => r.data),
  settings: () => client.get('/settings').then((r) => r.data),
  coupons: () => client.get('/coupons').then((r) => r.data),
  validateCoupon: (code, cart_total) => client.get('/coupons/validate', q({ code, cart_total })).then((r) => r.data),

  /* admin */
  dashboard: () => client.get('/admin/stats/dashboard').then((r) => r.data),
  customers: () => client.get('/admin/customers').then((r) => r.data),
  payments: () => client.get('/admin/payments').then((r) => r.data),
  adminBanners: () => client.get('/admin/banners').then((r) => r.data),
  saveBanner: (data) => (data.id ? client.put(`/admin/banners/${data.id}`, data) : client.post('/admin/banners', data)).then((r) => r.data),
  deleteBanner: (id) => client.delete(`/admin/banners/${id}`).then((r) => r.data),
  adminVideos: () => client.get('/admin/videos').then((r) => r.data),
  saveVideo: (data) => (data.id ? client.put(`/admin/videos/${data.id}`, data) : client.post('/admin/videos', data)).then((r) => r.data),
  deleteVideo: (id) => client.delete(`/admin/videos/${id}`).then((r) => r.data),
  adminCoupons: () => client.get('/admin/coupons').then((r) => r.data),
  saveCoupon: (data) => (data.id ? client.put(`/admin/coupons/${data.id}`, data) : client.post('/admin/coupons', data)).then((r) => r.data),
  deleteCoupon: (id) => client.delete(`/admin/coupons/${id}`).then((r) => r.data),
  saveSettings: (data) => client.put('/admin/settings', data).then((r) => r.data),
  saveWhatsApp: (data) => client.put('/admin/whatsapp', data).then((r) => r.data),
  upload: (formData) => client.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
};

export default client;
