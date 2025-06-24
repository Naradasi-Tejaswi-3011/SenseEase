import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

// Custom hook for API calls with loading, error, and data states
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { 
    immediate = true, 
    onSuccess, 
    onError,
    transform 
  } = options

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiCall(...args)
      const result = transform ? transform(response) : response
      
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      setError(err.message || 'An error occurred')
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, transform, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Specific hooks for common API operations
export const useProducts = (params = {}) => {
  return useApi(
    () => apiService.getProducts(params),
    [JSON.stringify(params)],
    {
      transform: (response) => response.data
    }
  )
}

export const useProduct = (productId) => {
  return useApi(
    () => apiService.getProduct(productId),
    [productId],
    {
      immediate: !!productId,
      transform: (response) => response.data
    }
  )
}

export const useCart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getCart()
      setCart(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId, quantity = 1, selectedVariants = []) => {
    try {
      setLoading(true)
      const response = await apiService.addToCart(productId, quantity, selectedVariants)
      setCart(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      setLoading(true)
      const response = await apiService.updateCartItem(itemId, quantity)
      setCart(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true)
      const response = await apiService.removeFromCart(itemId)
      setCart(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.clearCart()
      setCart(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch cart if user is authenticated
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      fetchCart()
    }
  }, [fetchCart])

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }
}

export const useWishlist = () => {
  return useApi(
    () => apiService.getWishlist(),
    [],
    {
      transform: (response) => response.data
    }
  )
}

export const useOrders = (params = {}) => {
  return useApi(
    () => apiService.getOrders(params),
    [JSON.stringify(params)],
    {
      transform: (response) => response.data
    }
  )
}

export const useUserProfile = () => {
  return useApi(
    () => apiService.getUserProfile(),
    [],
    {
      transform: (response) => response.data
    }
  )
}

// Hook for search functionality
export const useSearch = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, params = {}) => {
    if (!query.trim()) {
      setResults([])
      return []
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiService.searchProducts(query, params)
      setResults(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      setResults([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clearResults
  }
}

// Hook for analytics tracking
export const useAnalytics = () => {
  const trackEvent = useCallback(async (eventType, eventData, page) => {
    try {
      const sessionId = sessionStorage.getItem('analytics-session-id') || 
                       `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      if (!sessionStorage.getItem('analytics-session-id')) {
        sessionStorage.setItem('analytics-session-id', sessionId)
      }

      await apiService.trackEvent({
        sessionId,
        eventType,
        eventData,
        page: page || window.location.pathname
      })
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }, [])

  const trackStressEvent = useCallback(async (type, severity = 'medium', context = {}) => {
    try {
      const sessionId = sessionStorage.getItem('analytics-session-id')
      if (!sessionId) return

      await apiService.trackStressEvent({
        sessionId,
        type,
        severity,
        page: window.location.pathname,
        context
      })
    } catch (error) {
      console.warn('Stress event tracking failed:', error)
    }
  }, [])

  const endSession = useCallback(async (exitReason = 'natural') => {
    try {
      const sessionId = sessionStorage.getItem('analytics-session-id')
      if (!sessionId) return

      await apiService.endAnalyticsSession(
        sessionId,
        window.location.pathname,
        exitReason
      )
      
      sessionStorage.removeItem('analytics-session-id')
    } catch (error) {
      console.warn('End session tracking failed:', error)
    }
  }, [])

  return {
    trackEvent,
    trackStressEvent,
    endSession
  }
}

// Hook for managing async operations with toast notifications
export const useAsyncOperation = (options = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { 
    onSuccess, 
    onError,
    successMessage,
    errorMessage 
  } = options

  const execute = useCallback(async (operation) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await operation()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      if (successMessage) {
        // You can integrate with a toast library here
        console.log(successMessage)
      }
      
      return result
    } catch (err) {
      const message = err.message || errorMessage || 'An error occurred'
      setError(message)
      
      if (onError) {
        onError(err)
      }
      
      // You can integrate with a toast library here
      console.error(message)
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [onSuccess, onError, successMessage, errorMessage])

  return {
    loading,
    error,
    execute
  }
}
