// src/api/axiosInstance.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor de REQUEST ──────────────────────────────────────────────────
// Antes de que salga cada request, agarra el token y lo agrega al header
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor de RESPONSE ─────────────────────────────────────────────────
// Si la respuesta es un 401 (token expirado), intenta hacer refresh
// Si el refresh falla, limpia la sesión y manda al login
api.interceptors.response.use(
  (response) => response, // respuesta exitosa — pásala tal cual
  async (error) => {
    const original = error.config

    // _retry evita loops infinitos: si ya intentamos refresh y falló, no volver a intentar
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = sessionStorage.getItem('refresh_token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh/`,
          { refresh }
        )
        sessionStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original) // reintenta el request original con el nuevo token
      } catch {
        // Refresh falló — limpia sesión y redirige al login
        sessionStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api