// API Service Layer for SenseEase Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL)
console.log('Environment variables:', import.meta.env)

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('senseease-token')
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('senseease-token', token)
    } else {
      localStorage.removeItem('senseease-token')
    }
  }

  // Get authentication headers
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options
    }

    console.log('Making API request to:', url)
    console.log('Request config:', config)

    try {
      const response = await fetch(url, config)
      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url,
        config
      })
      throw error
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Authentication Methods
  async register(userData) {
    const response = await this.post('/auth/register', userData)
    if (response.success && response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials)
    if (response.success && response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async logout() {
    try {
      await this.post('/auth/logout')
    } finally {
      this.setToken(null)
    }
  }

  async getMe() {
    return this.get('/auth/me')
  }

  // Cart Methods
  async getCart() {
    return this.get('/cart')
  }

  // User Methods
  async getUserProfile() {
    return this.get('/users/profile')
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
