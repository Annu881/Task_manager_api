import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taskmanagerapi-production-8a33.up.railway.app/api/v1'

// Force HTTPS in production (when not localhost)
const finalApiUrl = (() => {
  // If it's localhost, keep as-is
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    return API_BASE_URL
  }

  // For all other URLs, force HTTPS
  return API_BASE_URL.replace(/^http:\/\//i, 'https://')
})()

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 API URL:', finalApiUrl)
  console.log('🔒 Using HTTPS:', finalApiUrl.startsWith('https://'))
}


export const apiClient = axios.create({
  baseURL: finalApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Important for CORS
})

// Runtime HTTPS enforcement interceptor (failsafe)
apiClient.interceptors.request.use(
  (config) => {
    // Force HTTPS for all non-localhost requests
    if (config.url && !config.url.includes('localhost') && !config.url.includes('127.0.0.1')) {
      if (config.url.startsWith('http://')) {
        console.warn('⚠️ Forcing HTTPS for:', config.url)
        config.url = config.url.replace(/^http:\/\//i, 'https://')
      }
    }

    // Also check baseURL
    if (config.baseURL && !config.baseURL.includes('localhost') && !config.baseURL.includes('127.0.0.1')) {
      if (config.baseURL.startsWith('http://')) {
        console.warn('⚠️ Forcing HTTPS for baseURL:', config.baseURL)
        config.baseURL = config.baseURL.replace(/^http:\/\//i, 'https://')
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)


apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${finalApiUrl}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token, refresh_token } = response.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)