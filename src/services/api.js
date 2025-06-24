// API Service Layer for SenseEase Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('senseease-token')
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
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

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // GET request with caching
  async get(endpoint, params = {}, useCache = true) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    const cacheKey = `GET:${url}`

    // Check cache for non-user-specific endpoints
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    const data = await this.request(url, { method: 'GET' })

    // Cache non-user-specific data
    if (useCache && !endpoint.includes('/auth/') && !endpoint.includes('/cart/') && !endpoint.includes('/orders/')) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }

    return data
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

  async updateProfile(data) {
    return this.put('/auth/updatedetails', data)
  }

  async updatePassword(data) {
    return this.put('/auth/updatepassword', data)
  }

  async forgotPassword(email) {
    return this.post('/auth/forgotpassword', { email })
  }

  async resetPassword(token, password) {
    return this.put(`/auth/resetpassword/${token}`, { password })
  }

  // Product Methods
  async getProducts(params = {}) {
    return this.get('/products', params)
  }

  async getProduct(id) {
    return this.get(`/products/${id}`)
  }

  async getProductsByCategory(category, params = {}) {
    return this.get(`/products/category/${category}`, params)
  }

  async searchProducts(query, params = {}) {
    return this.get('/products/search', { q: query, ...params })
  }

  async getFeaturedProducts(limit = 10) {
    return this.get('/products/featured', { limit })
  }

  async getRecommendations(productId) {
    return this.get(`/products/${productId}/recommendations`)
  }

  async addProductReview(productId, reviewData) {
    return this.post(`/products/${productId}/reviews`, reviewData)
  }

  // Cart Methods
  async getCart() {
    return this.get('/cart')
  }

  async addToCart(productId, quantity = 1, selectedVariants = []) {
    return this.post('/cart/add', { productId, quantity, selectedVariants })
  }

  async updateCartItem(itemId, quantity) {
    return this.put(`/cart/update/${itemId}`, { quantity })
  }

  async removeFromCart(itemId) {
    return this.delete(`/cart/remove/${itemId}`)
  }

  async clearCart() {
    return this.delete('/cart/clear')
  }

  async applyCoupon(couponCode) {
    return this.post('/cart/coupon', { couponCode })
  }

  async removeCoupon(couponCode) {
    return this.delete(`/cart/coupon/${couponCode}`)
  }

  async getCartSummary() {
    return this.get('/cart/summary')
  }

  // Order Methods
  async getOrders(params = {}) {
    return this.get('/orders', params)
  }

  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`)
  }

  async createOrder(orderData) {
    return this.post('/orders/create', orderData)
  }

  async cancelOrder(orderId, reason) {
    return this.put(`/orders/${orderId}/cancel`, { reason })
  }

  async requestReturn(orderId, reason) {
    return this.put(`/orders/${orderId}/return`, { reason })
  }

  async trackOrder(orderId) {
    return this.get(`/orders/${orderId}/tracking`)
  }

  async getOrderStats() {
    return this.get('/orders/stats')
  }

  // User Methods
  async getUserProfile() {
    return this.get('/users/profile')
  }

  async updateUserProfile(data) {
    return this.put('/users/profile', data)
  }

  async updateAccessibilityPreferences(preferences) {
    return this.put('/users/accessibility', preferences)
  }

  async completeOnboarding(data) {
    return this.put('/users/onboarding', data)
  }

  async getWishlist() {
    return this.get('/users/wishlist')
  }

  async addToWishlist(productId) {
    return this.post(`/users/wishlist/${productId}`)
  }

  async removeFromWishlist(productId) {
    return this.delete(`/users/wishlist/${productId}`)
  }

  async addAddress(addressData) {
    return this.post('/users/addresses', addressData)
  }

  async updateAddress(addressId, addressData) {
    return this.put(`/users/addresses/${addressId}`, addressData)
  }

  async deleteAddress(addressId) {
    return this.delete(`/users/addresses/${addressId}`)
  }

  // Analytics Methods
  async trackEvent(eventData) {
    return this.post('/analytics/track', eventData)
  }

  async trackStressEvent(stressData) {
    return this.post('/analytics/stress-event', stressData)
  }

  async getUserAnalyticsSummary(dateRange) {
    return this.get('/analytics/user-summary', dateRange ? { dateRange } : {})
  }

  async getAccessibilityInsights() {
    return this.get('/analytics/accessibility-insights')
  }

  async getStressInsights() {
    return this.get('/analytics/stress-insights')
  }

  async endAnalyticsSession(sessionId, exitPage, exitReason) {
    return this.post('/analytics/end-session', { sessionId, exitPage, exitReason })
  }

  // Admin Methods (require admin role)
  async getAdminDashboard() {
    return this.get('/admin/dashboard')
  }

  async getAdminUsers(params = {}) {
    return this.get('/admin/users', params)
  }

  async getAdminOrders(params = {}) {
    return this.get('/admin/orders', params)
  }

  async updateOrderStatus(orderId, status, notes) {
    return this.put(`/admin/orders/${orderId}/status`, { status, notes })
  }

  async createProduct(productData) {
    return this.post('/admin/products', productData)
  }

  async updateProduct(productId, productData) {
    return this.put(`/admin/products/${productId}`, productData)
  }

  async deleteProduct(productId) {
    return this.delete(`/admin/products/${productId}`)
  }

  async getAdminAnalytics(dateRange) {
    return this.get('/admin/analytics', dateRange ? { dateRange } : {})
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
