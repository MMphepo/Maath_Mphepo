/**
 * API Configuration for Django Backend Integration
 * Centralized configuration for all API calls to Django REST API
 */

// API Base URL - Django backend
export const API_BASE_URL = 'https://maath-mphepo.onrender.com' 

// API Endpoints mapping
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REFRESH: '/api/auth/refresh/',
    VERIFY: '/api/auth/verify/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
  },
  
  // Blog System
  BLOG: {
    LIST: '/api/blog/',
    DETAIL: (slug: string) => `/api/blog/${slug}/`,
    TAGS: '/api/blog/tags/',
    COMMENTS: (slug: string) => `/api/blog/${slug}/comments/`,
    LIKE: (slug: string) => `/api/blog/${slug}/like/`,
    SHARE: (slug: string) => `/api/blog/${slug}/share/`,
  },
  
  // Portfolio
  PROJECTS: {
    LIST: '/api/projects/',
    DETAIL: (id: string) => `/api/projects/${id}/`,
  },
  
  SKILLS: {
    LIST: '/api/skills/',
    CATEGORIES: '/api/skills/categories/',
  },
  
  // Contact & Communication
  CONTACT: {
    INFO: '/api/contact/info/',
    SUBMIT: '/api/contact/submit/',
    NEWSLETTER: '/api/contact/newsletter/subscribe/',
  },
  
  // Site Data
  TESTIMONIALS: '/api/testimonials/',
  ACHIEVEMENTS: '/api/achievements/',
  CONFIG: '/api/config/',
} as const

// Request configuration
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

// Authentication token management
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }
  
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }
  
  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }
  
  static clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  static clearInvalidTokens(): void {
    // Clear tokens if they exist but are invalid
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (accessToken || refreshToken) {
      console.log('Clearing potentially invalid tokens')
      this.clearTokens()
    }
  }
  
  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  static hasValidTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken())
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Enhanced fetch wrapper with Django backend integration
export class ApiClient {
  private static async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) return false
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ refresh: refreshToken }),
      })
      
      const data = await response.json()
      
      if (data.success && data.data.access) {
        TokenManager.setTokens(data.data.access, refreshToken)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    
    return false
  }
  
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        // Only add auth headers if explicitly required or if we have valid tokens
        ...(requireAuth || TokenManager.hasValidTokens() ? TokenManager.getAuthHeaders() : {}),
        ...options.headers,
      },
    }
    
    try {
      let response = await fetch(url, config)
      
      // Handle token refresh for 401 responses only if auth was required
      if (response.status === 401 && requireAuth && TokenManager.getRefreshToken()) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry request with new token
          config.headers = {
            ...config.headers,
            ...TokenManager.getAuthHeaders(),
          }
          response = await fetch(url, config)
        }
      } else if (response.status === 401 && !requireAuth) {
        // Clear invalid tokens for public endpoints
        TokenManager.clearTokens()
      }
      
      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `HTTP ${response.status}`,
        }
      }
      
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }
  
  static async get<T = any>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth)
  }

  static async post<T = any>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth)
  }

  static async put<T = any>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth)
  }

  static async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth)
  }
}

// Convenience functions for common API operations
export const api = {
  // Authentication
  auth: {
    login: (credentials: { username: string; password: string }) =>
      ApiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    logout: () => ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
    refresh: () => ApiClient.post(API_ENDPOINTS.AUTH.REFRESH),
    verify: () => ApiClient.get(API_ENDPOINTS.AUTH.VERIFY),
    changePassword: (data: { old_password: string; new_password: string }) =>
      ApiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  },
  
  // Blog
  blog: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : ''
      return ApiClient.get(`${API_ENDPOINTS.BLOG.LIST}${query}`, false) // Public endpoint
    },
    get: (slug: string) => ApiClient.get(API_ENDPOINTS.BLOG.DETAIL(slug), false), // Public endpoint
    tags: () => ApiClient.get(API_ENDPOINTS.BLOG.TAGS, false), // Public endpoint
    comments: (slug: string) => ApiClient.get(API_ENDPOINTS.BLOG.COMMENTS(slug), false), // Public endpoint
    like: (slug: string) => ApiClient.post(API_ENDPOINTS.BLOG.LIKE(slug), {}, false), // Public endpoint
    addComment: (slug: string, comment: any) =>
      ApiClient.post(API_ENDPOINTS.BLOG.COMMENTS(slug), comment, false), // Public endpoint
  },

  // Portfolio
  projects: {
    list: () => ApiClient.get(API_ENDPOINTS.PROJECTS.LIST, false), // Public endpoint
    get: (id: string) => ApiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id), false), // Public endpoint
  },

  skills: {
    list: () => ApiClient.get(API_ENDPOINTS.SKILLS.LIST, false), // Public endpoint
    categories: () => ApiClient.get(API_ENDPOINTS.SKILLS.CATEGORIES, false), // Public endpoint
  },

  // Contact
  contact: {
    info: () => ApiClient.get(API_ENDPOINTS.CONTACT.INFO, false), // Public endpoint
    submit: (data: any) => ApiClient.post(API_ENDPOINTS.CONTACT.SUBMIT, data, false), // Public endpoint
    newsletter: (email: string) =>
      ApiClient.post(API_ENDPOINTS.CONTACT.NEWSLETTER, { email }, false), // Public endpoint
  },

  // Site data
  testimonials: () => ApiClient.get(API_ENDPOINTS.TESTIMONIALS, false), // Public endpoint
  achievements: () => ApiClient.get(API_ENDPOINTS.ACHIEVEMENTS, false), // Public endpoint
  config: () => ApiClient.get(API_ENDPOINTS.CONFIG, false), // Public endpoint
}

export default api

// Initialize API client - clear invalid tokens on startup
if (typeof window !== 'undefined') {
  // Check if we have tokens but they might be invalid
  const hasTokens = TokenManager.getAccessToken() || TokenManager.getRefreshToken()
  if (hasTokens) {
    // Try a simple API call to verify tokens are valid
    api.config().catch(() => {
      // If config call fails, clear tokens
      console.log('Clearing invalid tokens on startup')
      TokenManager.clearTokens()
    })
  }
}
