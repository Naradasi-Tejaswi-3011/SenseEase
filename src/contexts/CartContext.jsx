import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import apiService from '../services/api'
import { useAnalytics } from '../hooks/useApi'

const CartContext = createContext()

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  loading: false,
  error: null,
}

// Action types
const actionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_CART: 'LOAD_CART',
}

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      let newItems
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        error: null
      }
    }
    
    case actionTypes.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount
      }
    }
    
    case actionTypes.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { type: actionTypes.REMOVE_ITEM, payload: id })
      }
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount
      }
    }
    
    case actionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      }
    
    case actionTypes.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen
      }
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      }
    
    case actionTypes.LOAD_CART:
      return {
        ...state,
        ...action.payload
      }
    
    default:
      return state
  }
}

// Provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user, isAuthenticated } = useAuth()
  const analytics = useAnalytics()

  // Load cart from API when user is authenticated
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      // Load from localStorage for guest users
      const savedCart = localStorage.getItem('senseease-cart')
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart)
          dispatch({ type: actionTypes.LOAD_CART, payload: cartData })
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      }
    }
  }, [user])

  // Save cart to localStorage for guest users only
  useEffect(() => {
    if (!user) {
      localStorage.setItem('senseease-cart', JSON.stringify({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      }))
    }
  }, [state.items, state.total, state.itemCount, user])

  // Load cart from API
  const loadCart = async () => {
    if (!user) return

    dispatch({ type: actionTypes.SET_LOADING, payload: true })

    try {
      const response = await apiService.getCart()
      dispatch({ type: actionTypes.LOAD_CART, payload: {
        items: response.data.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.primaryImage?.url,
          brand: item.product.brand,
          inStock: item.product.inStock,
          selectedVariants: item.selectedVariants
        })),
        total: response.data.subtotal,
        itemCount: response.data.itemCount
      }})
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  // Add item to cart
  const addItem = async (product, quantity = 1, selectedVariants = []) => {
    if (user) {
      // Use API for authenticated users
      dispatch({ type: actionTypes.SET_LOADING, payload: true })

      try {
        const response = await apiService.addToCart(product.id, quantity, selectedVariants)

        // Update local state with API response
        dispatch({ type: actionTypes.LOAD_CART, payload: {
          items: response.data.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.primaryImage?.url,
            brand: item.product.brand,
            inStock: item.product.inStock,
            selectedVariants: item.selectedVariants
          })),
          total: response.data.subtotal,
          itemCount: response.data.itemCount
        }})

        // Track cart event
        analytics.trackEvent('cart_event', {
          action: 'add',
          productId: product.id,
          quantity
        })

        console.log(`Added ${product.name} to cart`)
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
        console.error('Error adding item to cart:', error)
        throw error
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false })
      }
    } else {
      // Use local state for guest users
      try {
        dispatch({ type: actionTypes.ADD_ITEM, payload: { ...product, quantity } })
        console.log(`Added ${product.name} to cart`)
      } catch (error) {
        console.error('Error adding item to cart:', error)
        throw error
      }
    }
  }

  // Remove item from cart
  const removeItem = async (productId) => {
    if (user) {
      // Use API for authenticated users
      dispatch({ type: actionTypes.SET_LOADING, payload: true })

      try {
        // Find the cart item ID
        const cartItem = state.items.find(item => item.id === productId)
        if (!cartItem) return

        const response = await apiService.removeFromCart(cartItem.cartItemId || productId)

        // Update local state
        dispatch({ type: actionTypes.LOAD_CART, payload: {
          items: response.data.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.primaryImage?.url,
            brand: item.product.brand,
            inStock: item.product.inStock,
            selectedVariants: item.selectedVariants,
            cartItemId: item._id
          })),
          total: response.data.subtotal,
          itemCount: response.data.itemCount
        }})

        // Track cart event
        analytics.trackEvent('cart_event', {
          action: 'remove',
          productId
        })
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
        throw error
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false })
      }
    } else {
      // Use local state for guest users
      dispatch({ type: actionTypes.REMOVE_ITEM, payload: productId })
    }
  }

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (user) {
      // Use API for authenticated users
      dispatch({ type: actionTypes.SET_LOADING, payload: true })

      try {
        // Find the cart item ID
        const cartItem = state.items.find(item => item.id === productId)
        if (!cartItem) return

        const response = await apiService.updateCartItem(cartItem.cartItemId || productId, quantity)

        // Update local state
        dispatch({ type: actionTypes.LOAD_CART, payload: {
          items: response.data.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.primaryImage?.url,
            brand: item.product.brand,
            inStock: item.product.inStock,
            selectedVariants: item.selectedVariants,
            cartItemId: item._id
          })),
          total: response.data.subtotal,
          itemCount: response.data.itemCount
        }})

        // Track cart event
        analytics.trackEvent('cart_event', {
          action: 'update',
          productId,
          quantity
        })
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
        throw error
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false })
      }
    } else {
      // Use local state for guest users
      dispatch({ type: actionTypes.UPDATE_QUANTITY, payload: { id: productId, quantity } })
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (user) {
      try {
        await apiService.clearCart()
        dispatch({ type: actionTypes.CLEAR_CART })
        analytics.trackEvent('cart_event', { action: 'clear' })
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
        throw error
      }
    } else {
      dispatch({ type: actionTypes.CLEAR_CART })
    }
  }

  // Toggle cart visibility
  const toggleCart = () => {
    dispatch({ type: actionTypes.TOGGLE_CART })
  }

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  // Calculate shipping cost
  const getShippingCost = () => {
    if (state.total >= 35) return 0 // Free shipping over $35
    return 5.99
  }

  // Calculate tax
  const getTax = () => {
    return state.total * 0.08 // 8% tax
  }

  // Calculate final total
  const getFinalTotal = () => {
    return state.total + getShippingCost() + getTax()
  }

  // Get cart summary
  const getCartSummary = () => {
    return {
      subtotal: state.total,
      shipping: getShippingCost(),
      tax: getTax(),
      total: getFinalTotal(),
      itemCount: state.itemCount,
      items: state.items
    }
  }

  const value = {
    // State
    ...state,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    
    // Utilities
    getItemQuantity,
    isInCart,
    getShippingCost,
    getTax,
    getFinalTotal,
    getCartSummary,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the context
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
