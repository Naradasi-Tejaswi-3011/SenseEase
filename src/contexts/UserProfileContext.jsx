import React, { createContext, useContext, useReducer, useEffect } from 'react'

const UserProfileContext = createContext()

// Initial state for user profile
const initialState = {
  isOnboarded: false,
  preferences: {
    // Neurodiversity preferences
    hasADHD: false,
    hasAutism: false,
    hasDyslexia: false,
    hasSensoryIssues: false,
    isColorblind: false,
    colorblindType: null, // 'deuteranopia', 'protanopia', 'tritanopia'
    
    // UI preferences
    reducedMotion: false,
    highContrast: false,
    lowSaturation: false,
    dyslexicFont: false,
    textSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
    focusMode: false,
    
    // Shopping preferences
    hideCarousels: false,
    hidePopups: false,
    hideTimers: false,
    simplifiedNavigation: false,
    extendedTimeouts: false,
    
    // Accessibility preferences
    screenReader: false,
    keyboardNavigation: false,
    voiceControl: false,
  },
  shoppingHistory: {
    completedCheckouts: 0,
    focusModeUsage: 0,
    adaptationsUsed: [],
    comfortRating: null,
  }
}

// Action types
const actionTypes = {
  SET_ONBOARDED: 'SET_ONBOARDED',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_PREFERENCE: 'UPDATE_PREFERENCE',
  RESET_PROFILE: 'RESET_PROFILE',
  UPDATE_SHOPPING_HISTORY: 'UPDATE_SHOPPING_HISTORY',
  LOAD_PROFILE: 'LOAD_PROFILE',
}

// Reducer function
function userProfileReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_ONBOARDED:
      return {
        ...state,
        isOnboarded: action.payload
      }
    
    case actionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      }
    
    case actionTypes.UPDATE_PREFERENCE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.key]: action.value
        }
      }
    
    case actionTypes.UPDATE_SHOPPING_HISTORY:
      return {
        ...state,
        shoppingHistory: {
          ...state.shoppingHistory,
          ...action.payload
        }
      }
    
    case actionTypes.LOAD_PROFILE:
      return {
        ...state,
        ...action.payload
      }
    
    case actionTypes.RESET_PROFILE:
      return initialState
    
    default:
      return state
  }
}

// Provider component
export function UserProfileProvider({ children }) {
  const [state, dispatch] = useReducer(userProfileReducer, initialState)

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('senseease-profile')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        dispatch({ type: actionTypes.LOAD_PROFILE, payload: parsedProfile })
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }
  }, [])

  // Save profile to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('senseease-profile', JSON.stringify(state))
  }, [state])

  // Action creators
  const setOnboarded = (isOnboarded) => {
    dispatch({ type: actionTypes.SET_ONBOARDED, payload: isOnboarded })
  }

  const updatePreferences = (preferences) => {
    dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: preferences })
  }

  const updatePreference = (key, value) => {
    dispatch({ type: actionTypes.UPDATE_PREFERENCE, key, value })
  }

  const updateShoppingHistory = (history) => {
    dispatch({ type: actionTypes.UPDATE_SHOPPING_HISTORY, payload: history })
  }

  const resetProfile = () => {
    dispatch({ type: actionTypes.RESET_PROFILE })
    localStorage.removeItem('senseease-profile')
  }

  // Helper functions
  const incrementCheckouts = () => {
    updateShoppingHistory({
      completedCheckouts: state.shoppingHistory.completedCheckouts + 1
    })
  }

  const incrementFocusModeUsage = () => {
    updateShoppingHistory({
      focusModeUsage: state.shoppingHistory.focusModeUsage + 1
    })
  }

  const addAdaptationUsed = (adaptation) => {
    const adaptations = [...state.shoppingHistory.adaptationsUsed]
    if (!adaptations.includes(adaptation)) {
      adaptations.push(adaptation)
      updateShoppingHistory({ adaptationsUsed: adaptations })
    }
  }

  const setComfortRating = (rating) => {
    updateShoppingHistory({ comfortRating: rating })
  }

  const value = {
    // State
    ...state,
    
    // Actions
    setOnboarded,
    updatePreferences,
    updatePreference,
    updateShoppingHistory,
    resetProfile,
    
    // Helper functions
    incrementCheckouts,
    incrementFocusModeUsage,
    addAdaptationUsed,
    setComfortRating,
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

// Custom hook to use the context
export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}

export default UserProfileContext
