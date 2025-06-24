import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import apiService from '../services/api'

const ShoppingContext = createContext()

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_FEATURED_PRODUCTS: 'SET_FEATURED_PRODUCTS',
  SET_CATEGORIES: 'SET_CATEGORIES'
}

// Initial state
const initialState = {
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0
  },
  products: [],
  featuredProducts: [],
  categories: [],
  loading: false,
  error: null
}

// Reducer function
function shoppingReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case actionTypes.SET_CART:
      return { ...state, cart: action.payload }
    
    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload }
    
    case actionTypes.SET_FEATURED_PRODUCTS:
      return { ...state, featuredProducts: action.payload }
    
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload }
    
    default:
      return state
  }
}

// Provider component
export function ShoppingProvider({ children }) {
  const [state, dispatch] = useReducer(shoppingReducer, initialState)
  const { isAuthenticated } = useAuth()

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart()
    }
  }, [isAuthenticated])

  // Load initial data
  useEffect(() => {
    loadFeaturedProducts()
    loadCategories()
  }, [])

  // Cart operations
  const loadCart = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await apiService.get('/cart')
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data })
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await apiService.post('/cart/add', { productId, quantity })
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data })
        return { success: true, message: response.message }
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await apiService.put('/cart/update', { productId, quantity })
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data })
        return { success: true }
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await apiService.delete(`/cart/remove/${productId}`)
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data })
        return { success: true }
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await apiService.delete('/cart/clear')
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data })
        return { success: true }
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  // Product operations
  const loadProducts = async (filters = {}) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const queryParams = new URLSearchParams(filters).toString()
      const response = await apiService.get(`/products?${queryParams}`)
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_PRODUCTS, payload: response.data })
        return response
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const loadFeaturedProducts = async () => {
    try {
      const response = await apiService.get('/products/featured')
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_FEATURED_PRODUCTS, payload: response.data })
      }
    } catch (error) {
      console.error('Error loading featured products:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await apiService.get('/products/categories')
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: response.data })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const searchProducts = async (query, filters = {}) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const queryParams = new URLSearchParams({ q: query, ...filters }).toString()
      const response = await apiService.get(`/products/search?${queryParams}`)
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_PRODUCTS, payload: response.data })
        return response
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const getProduct = async (productId) => {
    try {
      const response = await apiService.get(`/products/${productId}`)
      return response
    } catch (error) {
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR })
  }

  const value = {
    // State
    ...state,

    // Cart actions
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,

    // Product actions
    loadProducts,
    loadFeaturedProducts,
    loadCategories,
    searchProducts,
    getProduct,

    // Utility actions
    clearError
  }

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  )
}

// Custom hook to use the context
export function useShopping() {
  const context = useContext(ShoppingContext)
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider')
  }
  return context
}

export default ShoppingContext
