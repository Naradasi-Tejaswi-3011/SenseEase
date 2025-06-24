import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import apiService from '../services/api'

const AuthContext = createContext()

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  users: [
    // Demo user for testing
    {
      id: 'demo-user',
      email: 'demo@senseease.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      phone: '(555) 123-4567',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
      orderHistory: [],
      wishlist: [],
      addresses: [],
      paymentMethods: []
    }
  ], // Simulated user database
}

// Action types
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_USERS: 'LOAD_USERS',
  UPDATE_USER: 'UPDATE_USER',
}

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case actionTypes.LOGIN_START:
    case actionTypes.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      }
    
    case actionTypes.LOGIN_FAILURE:
    case actionTypes.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      }
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null
      }
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    case actionTypes.LOAD_USERS:
      return {
        ...state,
        users: action.payload
      }
    
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      }
    
    default:
      return state
  }
}

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const stateRef = useRef(state)
  const [usersLoaded, setUsersLoaded] = useState(false)

  // Keep ref updated
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Load auth state from localStorage and validate with API on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('senseease-token')

      if (savedToken) {
        try {
          // Set token in API service
          apiService.setToken(savedToken)

          // Validate token and get user data
          const response = await apiService.getMe()
          if (response.success) {
            dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data })
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('senseease-token')
            apiService.setToken(null)
          }
        } catch (error) {
          console.error('Error validating auth token:', error)
          localStorage.removeItem('senseease-token')
          apiService.setToken(null)
        }
      }

      setUsersLoaded(true)
    }

    initializeAuth()
  }, [])

  // Save auth state to localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem('senseease-auth', JSON.stringify({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }))
    } else {
      localStorage.removeItem('senseease-auth')
    }
  }, [state.isAuthenticated, state.user])



  // Simulate API delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Login function
  const login = async (email, password) => {
    dispatch({ type: actionTypes.LOGIN_START })

    try {
      const response = await apiService.login({ email, password })

      if (response.success) {
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.user })
        return { success: true }
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: actionTypes.REGISTER_START })

    try {
      const response = await apiService.register(userData)

      if (response.success) {
        dispatch({ type: actionTypes.REGISTER_SUCCESS, payload: response.user })
        return { success: true }
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error) {
      dispatch({ type: actionTypes.REGISTER_FAILURE, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout()
    } finally {
      dispatch({ type: actionTypes.LOGOUT })
      localStorage.removeItem('senseease-auth')
    }
  }

  // Update user function
  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...stateRef.current.user, ...updatedData }
      dispatch({ type: actionTypes.UPDATE_USER, payload: updatedUser })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR })
  }

  const value = {
    // State
    ...state,
    usersLoaded,

    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
