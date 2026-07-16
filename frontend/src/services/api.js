import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Do not attach Authorization header from localStorage; rely on HttpOnly cookie set by the server.
api.interceptors.request.use((config) => config, (error) => Promise.reject(error))

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      // On 401 clear cached user info and force login. Token is cookie-based.
      localStorage.removeItem('ngo_user')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
