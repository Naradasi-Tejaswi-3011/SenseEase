import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import apiService from '../services/api'

const AuthContext = createContext()

// Action types
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
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
    
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      }
    
    default:
      return state
  }
}

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [initialized, setInitialized] = useState(false)

  // Load auth state from localStorage and validate with API on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('senseease-token')
      const savedUser = localStorage.getItem('senseease-user')

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
            localStorage.removeItem('senseease-user')
            apiService.setToken(null)
          }
        } catch (error) {
          console.error('Error validating auth token:', error)
          localStorage.removeItem('senseease-token')
          localStorage.removeItem('senseease-user')
          apiService.setToken(null)
        }
      } else if (savedUser) {
        // If we have user data but no token, restore user state
        try {
          const userData = JSON.parse(savedUser)
          dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: userData })
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('senseease-user')
        }
      }

      setInitialized(true)
    }

    initializeAuth()
  }, [])

  // Save auth state to localStorage (user data only, token is handled by API service)
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem('senseease-user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('senseease-user')
    }
  }, [state.isAuthenticated, state.user])

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
    console.log('Starting registration with data:', userData)
    dispatch({ type: actionTypes.REGISTER_START })

    try {
      const response = await apiService.register(userData)
      console.log('Registration response:', response)

      if (response.success) {
        dispatch({ type: actionTypes.REGISTER_SUCCESS, payload: response.user })
        return { success: true }
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
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
      localStorage.removeItem('senseease-user')
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR })
  }

  const value = {
    // State
    ...state,
    initialized,

    // Actions
    login,
    register,
    logout,
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
