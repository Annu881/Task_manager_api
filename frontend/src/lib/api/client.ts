import axios from 'axios'

// Get the API URL from environment variable or use default
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://taskmanagerapi-production-8a33.up.railway.app/api/v1'

// CRITICAL: Always force HTTPS for production Railway URLs
const API_BASE_URL = (() => {
  // If it's localhost, keep as-is
  if (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1')) {
    return rawApiUrl
  }

  // For Railway URLs, ALWAYS force HTTPS
  if (rawApiUrl.includes('railway.app')) {
    return rawApiUrl.replace(/^http:\/\//i, 'https://')
  }

  // For any other production URL, force HTTPS
  return rawApiUrl.replace(/^http:\/\//i, 'https://')
})()

// Force HTTPS in production (when not localhost)
const finalApiUrl = (() => {
  // If it's localhost, keep as-is
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    return API_BASE_URL
  }

  // For all other URLs, force HTTPS
  return API_BASE_URL.replace(/^http:\/\//i, 'https://')
})()

// Enhanced logging for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 Environment Variable (raw):', process.env.NEXT_PUBLIC_API_URL)
  console.log('🔍 Raw API URL:', rawApiUrl)
  console.log('🌐 Final API URL:', finalApiUrl)
  console.log('🔒 Using HTTPS:', finalApiUrl.startsWith('https://'))

  // Alert if HTTP is detected
  if (finalApiUrl.startsWith('http://')) {
    console.error('❌ WARNING: Still using HTTP! This will cause Mixed Content errors!')
    console.error('❌ Please update NEXT_PUBLIC_API_URL in Vercel to use https://')
  } else {
    console.log('✅ HTTPS correctly configured')
  }
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