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
  copyTrip:  (token)     => api.post(`/trips/public/${token}/copy`),
}

/* ── Stop endpoints ────────────────────────────────────────── */
export const stopAPI = {
  listByTrip:     (tripId)            => api.get(`/stops/trip/${tripId}`),
  create:         (tripId, data)      => api.post(`/stops/trip/${tripId}`, data),
  update:         (id, data)          => api.patch(`/stops/${id}`, data),
  remove:         (id)                => api.delete(`/stops/${id}`),
  reorder:        (tripId, stops)     => api.patch(`/stops/reorder/${tripId}`, { stops }),
}

/* ── City endpoints ────────────────────────────────────────── */
export const cityAPI = {
  list: (params) => api.get('/cities', { params }),
  get:  (id)     => api.get(`/cities/${id}`),
}

/* ── Activity endpoints ────────────────────────────────────── */
export const activityAPI = {
  list:           (params)            => api.get('/activities', { params }),
  listByCity:     (cityId, params)    => api.get(`/activities/city/${cityId}`, { params }),
  get:            (id)                => api.get(`/activities/${id}`),
  addToStop:      (stopId, data)      => api.post(`/activities/stop/${stopId}`, data),
  removeFromStop: (stopId, actId)     => api.delete(`/activities/stop/${stopId}/${actId}`),
}

/* ── Budget endpoints ──────────────────────────────────────── */
export const budgetAPI = {
  list:   (tripId)       => api.get(`/budget/trip/${tripId}`),
  create: (tripId, data) => api.post(`/budget/trip/${tripId}`, data),
  update: (id, data)     => api.patch(`/budget/${id}`, data),
  remove: (id)           => api.delete(`/budget/${id}`),
}

/* ── Packing endpoints ─────────────────────────────────────── */
export const packingAPI = {
  list:   (tripId)       => api.get(`/packing/trip/${tripId}`),
  create: (tripId, data) => api.post(`/packing/trip/${tripId}`, data),
  update: (id, data)     => api.patch(`/packing/${id}`, data),
  remove: (id)           => api.delete(`/packing/${id}`),
  reset:  (tripId)       => api.patch(`/packing/reset/${tripId}`),
}

/* ── Notes endpoints ───────────────────────────────────────── */
export const notesAPI = {
  list:   (tripId)       => api.get(`/notes/trip/${tripId}`),
  create: (tripId, data) => api.post(`/notes/trip/${tripId}`, data),
  update: (id, data)     => api.patch(`/notes/${id}`, data),
  remove: (id)           => api.delete(`/notes/${id}`),
}

/* ── Admin endpoints ───────────────────────────────────────── */
export const adminAPI = {
  stats:     () => api.get('/admin/stats'),
  topCities: () => api.get('/admin/cities'),
  users:     () => api.get('/admin/users'),
}

/* ── Community endpoints ────────────────────────────────────── */
export const communityAPI = {
  feed:       (params) => api.get('/community', { params }),
  toggleLike: (tripId) => api.post(`/community/${tripId}/like`),
}

export default api
