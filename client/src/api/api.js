import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/* ── Request interceptor: attach JWT ───────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('traveloop_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor: handle 401 globally ────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('traveloop_token')
      localStorage.removeItem('traveloop_user')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  }
)

/* ── Auth endpoints ────────────────────────────────────────── */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

/* ── Trip endpoints ────────────────────────────────────────── */
export const tripAPI = {
  list:      ()          => api.get('/trips'),
  get:       (id)        => api.get(`/trips/${id}`),
  create:    (data)      => api.post('/trips', data),
  update:    (id, data)  => api.put(`/trips/${id}`, data),
  remove:    (id)        => api.delete(`/trips/${id}`),
  getPublic: (token)     => api.get(`/trips/public/${token}`),
}

/* ── Stop endpoints ────────────────────────────────────────── */
export const stopAPI = {
  list:           (tripId)       => api.get(`/stops?trip_id=${tripId}`),
  create:         (data)         => api.post('/stops', data),
  update:         (id, data)     => api.put(`/stops/${id}`, data),
  remove:         (id)           => api.delete(`/stops/${id}`),
  reorder:        (id, data)     => api.patch(`/stops/${id}/reorder`, data),
  addActivity:    (id, actId)    => api.post(`/stops/${id}/activities`, { activity_id: actId }),
  removeActivity: (id, actId)    => api.delete(`/stops/${id}/activities/${actId}`),
}

/* ── City endpoints ────────────────────────────────────────── */
export const cityAPI = {
  list: (params) => api.get('/cities', { params }),
  get:  (id)     => api.get(`/cities/${id}`),
}

/* ── Activity endpoints ────────────────────────────────────── */
export const activityAPI = {
  list: (params) => api.get('/activities', { params }),
  get:  (id)     => api.get(`/activities/${id}`),
}

/* ── Budget endpoints ──────────────────────────────────────── */
export const budgetAPI = {
  list:   (tripId)    => api.get(`/budget?trip_id=${tripId}`),
  create: (data)      => api.post('/budget', data),
  update: (id, data)  => api.put(`/budget/${id}`, data),
  remove: (id)        => api.delete(`/budget/${id}`),
}

/* ── Packing endpoints ─────────────────────────────────────── */
export const packingAPI = {
  list:   (tripId)    => api.get(`/packing?trip_id=${tripId}`),
  create: (data)      => api.post('/packing', data),
  update: (id, data)  => api.put(`/packing/${id}`, data),
  remove: (id)        => api.delete(`/packing/${id}`),
}

/* ── Notes endpoints ───────────────────────────────────────── */
export const notesAPI = {
  list:   (tripId)    => api.get(`/notes?trip_id=${tripId}`),
  create: (data)      => api.post('/notes', data),
  update: (id, data)  => api.put(`/notes/${id}`, data),
  remove: (id)        => api.delete(`/notes/${id}`),
}

/* ── Admin endpoints ───────────────────────────────────────── */
export const adminAPI = {
  stats:     () => api.get('/admin/stats'),
  topCities: () => api.get('/admin/cities'),
  users:     () => api.get('/admin/users'),
}

export default api
