import React, { createContext, useContext, useReducer, useEffect } from 'react'
import apiService from '../services/api'
import { useAnalytics } from '../hooks/useApi'

const ProductContext = createContext()

// Action types
const actionTypes = {
  LOAD_PRODUCTS_START: 'LOAD_PRODUCTS_START',
  LOAD_PRODUCTS_SUCCESS: 'LOAD_PRODUCTS_SUCCESS',
  LOAD_PRODUCTS_FAILURE: 'LOAD_PRODUCTS_FAILURE',
  LOAD_PRODUCT_START: 'LOAD_PRODUCT_START',
  LOAD_PRODUCT_SUCCESS: 'LOAD_PRODUCT_SUCCESS',
  LOAD_PRODUCT_FAILURE: 'LOAD_PRODUCT_FAILURE',
  SEARCH_PRODUCTS_START: 'SEARCH_PRODUCTS_START',
  SEARCH_PRODUCTS_SUCCESS: 'SEARCH_PRODUCTS_SUCCESS',
  SEARCH_PRODUCTS_FAILURE: 'SEARCH_PRODUCTS_FAILURE',
  LOAD_FEATURED_PRODUCTS: 'LOAD_FEATURED_PRODUCTS',
  LOAD_RECOMMENDATIONS: 'LOAD_RECOMMENDATIONS',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  ADD_REVIEW: 'ADD_REVIEW'
}

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  searchResults: [],
  recommendations: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    subcategory: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    featured: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  searchQuery: '',
  searchLoading: false
}

// Reducer
const productReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOAD_PRODUCTS_START:
      return {
        ...state,
        loading: true,
        error: null
      }

    case actionTypes.LOAD_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload.data,
        pagination: {
          ...state.pagination,
          page: action.payload.currentPage,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        }
      }

    case actionTypes.LOAD_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case actionTypes.LOAD_PRODUCT_START:
      return {
        ...state,
        loading: true,
        error: null
      }

    case actionTypes.LOAD_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentProduct: action.payload
      }

    case actionTypes.LOAD_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case actionTypes.SEARCH_PRODUCTS_START:
      return {
        ...state,
        searchLoading: true,
        error: null
      }

    case actionTypes.SEARCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload.data,
        searchQuery: action.payload.query
      }

    case actionTypes.SEARCH_PRODUCTS_FAILURE:
      return {
        ...state,
        searchLoading: false,
        error: action.payload
      }

    case actionTypes.LOAD_FEATURED_PRODUCTS:
      return {
        ...state,
        featuredProducts: action.payload
      }

    case actionTypes.LOAD_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload
      }

    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }

    case actionTypes.CLEAR_SEARCH:
      return {
        ...state,
        searchResults: [],
        searchQuery: '',
        searchLoading: false
      }

    case actionTypes.ADD_REVIEW:
      return {
        ...state,
        currentProduct: state.currentProduct ? {
          ...state.currentProduct,
          reviews: [...state.currentProduct.reviews, action.payload]
        } : null
      }

    default:
      return state
  }
}

// Provider component
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState)
  const analytics = useAnalytics()

  // Load products with filters
  const loadProducts = async (filters = {}, page = 1) => {
    dispatch({ type: actionTypes.LOAD_PRODUCTS_START })
    
    try {
      const params = {
        ...state.filters,
        ...filters,
        page,
        limit: state.pagination.limit
      }

      const response = await apiService.getProducts(params)
      
      dispatch({ 
        type: actionTypes.LOAD_PRODUCTS_SUCCESS, 
        payload: response 
      })

      // Track product browsing
      analytics.trackEvent('products_viewed', {
        filters: params,
        resultCount: response.count
      })

      return response
    } catch (error) {
      dispatch({ 
        type: actionTypes.LOAD_PRODUCTS_FAILURE, 
        payload: error.message 
      })
      throw error
    }
  }

  // Load single product
  const loadProduct = async (productId) => {
    dispatch({ type: actionTypes.LOAD_PRODUCT_START })
    
    try {
      const response = await apiService.getProduct(productId)
      
      dispatch({ 
        type: actionTypes.LOAD_PRODUCT_SUCCESS, 
        payload: response.data 
      })

      // Track product view
      analytics.trackEvent('product_viewed', {
        productId,
        productName: response.data.name,
        category: response.data.category
      })

      return response.data
    } catch (error) {
      dispatch({ 
        type: actionTypes.LOAD_PRODUCT_FAILURE, 
        payload: error.message 
      })
      throw error
    }
  }

  // Search products
  const searchProducts = async (query, filters = {}) => {
    if (!query.trim()) {
      dispatch({ type: actionTypes.CLEAR_SEARCH })
      return
    }

    dispatch({ type: actionTypes.SEARCH_PRODUCTS_START })
    
    try {
      const response = await apiService.searchProducts(query, filters)
      
      dispatch({ 
        type: actionTypes.SEARCH_PRODUCTS_SUCCESS, 
        payload: response 
      })

      // Track search
      analytics.trackEvent('search', {
        query,
        resultsCount: response.count,
        filters
      })

      return response
    } catch (error) {
      dispatch({ 
        type: actionTypes.SEARCH_PRODUCTS_FAILURE, 
        payload: error.message 
      })
      throw error
    }
  }

  // Load featured products
  const loadFeaturedProducts = async (limit = 10) => {
    try {
      const response = await apiService.getFeaturedProducts(limit)
      
      dispatch({ 
        type: actionTypes.LOAD_FEATURED_PRODUCTS, 
        payload: response.data 
      })

      return response.data
    } catch (error) {
      console.error('Failed to load featured products:', error)
    }
  }

  // Load product recommendations
  const loadRecommendations = async (productId) => {
    try {
      const response = await apiService.getRecommendations(productId)
      
      dispatch({ 
        type: actionTypes.LOAD_RECOMMENDATIONS, 
        payload: response.data 
      })

      return response.data
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    }
  }

  // Add product review
  const addReview = async (productId, reviewData) => {
    try {
      await apiService.addProductReview(productId, reviewData)
      
      // Reload product to get updated reviews
      await loadProduct(productId)

      // Track review submission
      analytics.trackEvent('review_submitted', {
        productId,
        rating: reviewData.rating
      })

      return true
    } catch (error) {
      throw error
    }
  }

  // Set filters
  const setFilters = (newFilters) => {
    dispatch({ 
      type: actionTypes.SET_FILTERS, 
      payload: newFilters 
    })
  }

  // Clear search
  const clearSearch = () => {
    dispatch({ type: actionTypes.CLEAR_SEARCH })
  }

  // Load products by category
  const loadProductsByCategory = async (category, params = {}) => {
    try {
      const response = await apiService.getProductsByCategory(category, params)
      
      dispatch({ 
        type: actionTypes.LOAD_PRODUCTS_SUCCESS, 
        payload: response 
      })

      // Track category browsing
      analytics.trackEvent('category_viewed', {
        category,
        resultCount: response.count
      })

      return response
    } catch (error) {
      dispatch({ 
        type: actionTypes.LOAD_PRODUCTS_FAILURE, 
        payload: error.message 
      })
      throw error
    }
  }

  // Load initial featured products
  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const value = {
    ...state,
    loadProducts,
    loadProduct,
    searchProducts,
    loadFeaturedProducts,
    loadRecommendations,
    loadProductsByCategory,
    addReview,
    setFilters,
    clearSearch
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

// Hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}
