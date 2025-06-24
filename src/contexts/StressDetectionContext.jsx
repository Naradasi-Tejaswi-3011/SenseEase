import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useUserProfile } from './UserProfileContext'
import { useAccessibility } from './AccessibilityContext'

const StressDetectionContext = createContext()

// Initial state for stress detection
const initialState = {
  isMonitoring: true,
  stressLevel: 'low', // 'low', 'medium', 'high'
  detectedPatterns: [],
  suggestions: [],
  showSuggestionModal: false,
  behaviorMetrics: {
    rapidNavigation: 0,
    longPauses: 0,
    failedSubmissions: 0,
    erraticScrolling: 0,
    repeatedClicks: 0,
    backButtonUsage: 0,
  },
  sessionData: {
    startTime: Date.now(),
    pageViews: [],
    interactions: [],
    currentPage: '/',
    timeOnPage: 0,
  }
}

// Action types
const actionTypes = {
  UPDATE_STRESS_LEVEL: 'UPDATE_STRESS_LEVEL',
  ADD_DETECTED_PATTERN: 'ADD_DETECTED_PATTERN',
  UPDATE_BEHAVIOR_METRICS: 'UPDATE_BEHAVIOR_METRICS',
  ADD_SUGGESTION: 'ADD_SUGGESTION',
  CLEAR_SUGGESTIONS: 'CLEAR_SUGGESTIONS',
  SHOW_SUGGESTION_MODAL: 'SHOW_SUGGESTION_MODAL',
  HIDE_SUGGESTION_MODAL: 'HIDE_SUGGESTION_MODAL',
  UPDATE_SESSION_DATA: 'UPDATE_SESSION_DATA',
  RESET_SESSION: 'RESET_SESSION',
}

// Reducer function
function stressDetectionReducer(state, action) {
  switch (action.type) {
    case actionTypes.UPDATE_STRESS_LEVEL:
      return {
        ...state,
        stressLevel: action.payload
      }
    
    case actionTypes.ADD_DETECTED_PATTERN:
      return {
        ...state,
        detectedPatterns: [...state.detectedPatterns, action.payload]
      }
    
    case actionTypes.UPDATE_BEHAVIOR_METRICS:
      return {
        ...state,
        behaviorMetrics: {
          ...state.behaviorMetrics,
          ...action.payload
        }
      }
    
    case actionTypes.ADD_SUGGESTION:
      return {
        ...state,
        suggestions: [...state.suggestions, action.payload]
      }
    
    case actionTypes.CLEAR_SUGGESTIONS:
      return {
        ...state,
        suggestions: []
      }
    
    case actionTypes.SHOW_SUGGESTION_MODAL:
      return {
        ...state,
        showSuggestionModal: true
      }
    
    case actionTypes.HIDE_SUGGESTION_MODAL:
      return {
        ...state,
        showSuggestionModal: false
      }
    
    case actionTypes.UPDATE_SESSION_DATA:
      return {
        ...state,
        sessionData: {
          ...state.sessionData,
          ...action.payload
        }
      }
    
    case actionTypes.RESET_SESSION:
      return {
        ...initialState,
        sessionData: {
          ...initialState.sessionData,
          startTime: Date.now()
        }
      }
    
    default:
      return state
  }
}

// Provider component
export function StressDetectionProvider({ children }) {
  const [state, dispatch] = useReducer(stressDetectionReducer, initialState)
  const { preferences, addAdaptationUsed } = useUserProfile()
  const { toggleFocusMode, announceToScreenReader } = useAccessibility()

  // Track page navigation
  const trackPageView = useCallback((path) => {
    const now = Date.now()
    const timeOnPreviousPage = now - state.sessionData.startTime

    dispatch({
      type: actionTypes.UPDATE_SESSION_DATA,
      payload: {
        currentPage: path,
        pageViews: [...state.sessionData.pageViews, {
          path,
          timestamp: now,
          timeOnPreviousPage
        }],
        timeOnPage: 0
      }
    })
  }, [state.sessionData.startTime])

  // Track user interactions
  const trackInteraction = useCallback((type, details = {}) => {
    const interaction = {
      type,
      timestamp: Date.now(),
      page: state.sessionData.currentPage,
      ...details
    }

    dispatch({
      type: actionTypes.UPDATE_SESSION_DATA,
      payload: {
        interactions: [...state.sessionData.interactions, interaction]
      }
    })

    // Analyze interaction for stress patterns
    analyzeInteraction(interaction)
  }, [state.sessionData.currentPage, state.sessionData.interactions])

  // Analyze interactions for stress patterns
  const analyzeInteraction = useCallback((interaction) => {
    const recentInteractions = state.sessionData.interactions.slice(-10)
    const now = Date.now()

    // Detect rapid navigation (more than 3 page changes in 30 seconds)
    if (interaction.type === 'navigation') {
      const recentNavigation = recentInteractions.filter(
        i => i.type === 'navigation' && (now - i.timestamp) < 30000
      )
      
      if (recentNavigation.length >= 3) {
        dispatch({
          type: actionTypes.UPDATE_BEHAVIOR_METRICS,
          payload: { rapidNavigation: state.behaviorMetrics.rapidNavigation + 1 }
        })
        
        dispatch({
          type: actionTypes.ADD_DETECTED_PATTERN,
          payload: {
            type: 'rapid_navigation',
            timestamp: now,
            severity: 'medium'
          }
        })
      }
    }

    // Detect repeated clicks on same element
    if (interaction.type === 'click') {
      const recentClicks = recentInteractions.filter(
        i => i.type === 'click' && 
        i.elementId === interaction.elementId && 
        (now - i.timestamp) < 5000
      )
      
      if (recentClicks.length >= 3) {
        dispatch({
          type: actionTypes.UPDATE_BEHAVIOR_METRICS,
          payload: { repeatedClicks: state.behaviorMetrics.repeatedClicks + 1 }
        })
        
        dispatch({
          type: actionTypes.ADD_DETECTED_PATTERN,
          payload: {
            type: 'repeated_clicks',
            timestamp: now,
            severity: 'high'
          }
        })
      }
    }

    // Detect form submission failures
    if (interaction.type === 'form_error') {
      dispatch({
        type: actionTypes.UPDATE_BEHAVIOR_METRICS,
        payload: { failedSubmissions: state.behaviorMetrics.failedSubmissions + 1 }
      })
      
      dispatch({
        type: actionTypes.ADD_DETECTED_PATTERN,
        payload: {
          type: 'form_failure',
          timestamp: now,
          severity: 'high'
        }
      })
    }

    // Detect erratic scrolling
    if (interaction.type === 'scroll') {
      const recentScrolls = recentInteractions.filter(
        i => i.type === 'scroll' && (now - i.timestamp) < 2000
      )
      
      if (recentScrolls.length >= 5) {
        dispatch({
          type: actionTypes.UPDATE_BEHAVIOR_METRICS,
          payload: { erraticScrolling: state.behaviorMetrics.erraticScrolling + 1 }
        })
        
        dispatch({
          type: actionTypes.ADD_DETECTED_PATTERN,
          payload: {
            type: 'erratic_scrolling',
            timestamp: now,
            severity: 'medium'
          }
        })
      }
    }

  }, [state.sessionData.interactions, state.behaviorMetrics])

  // Calculate stress level based on detected patterns
  const calculateStressLevel = useCallback(() => {
    const recentPatterns = state.detectedPatterns.filter(
      pattern => (Date.now() - pattern.timestamp) < 60000 // Last minute
    )

    const highSeverityCount = recentPatterns.filter(p => p.severity === 'high').length
    const mediumSeverityCount = recentPatterns.filter(p => p.severity === 'medium').length

    let newStressLevel = 'low'
    
    if (highSeverityCount >= 2 || mediumSeverityCount >= 3) {
      newStressLevel = 'high'
    } else if (highSeverityCount >= 1 || mediumSeverityCount >= 2) {
      newStressLevel = 'medium'
    }

    if (newStressLevel !== state.stressLevel) {
      dispatch({
        type: actionTypes.UPDATE_STRESS_LEVEL,
        payload: newStressLevel
      })

      // Generate suggestions based on stress level
      generateSuggestions(newStressLevel, recentPatterns)
    }
  }, [state.detectedPatterns, state.stressLevel])

  // Generate suggestions based on stress patterns
  const generateSuggestions = useCallback((stressLevel, patterns) => {
    const suggestions = []

    if (stressLevel === 'high') {
      suggestions.push({
        id: 'focus_mode',
        title: 'Switch to Focus Mode',
        description: 'Simplify the interface to reduce distractions',
        action: () => {
          toggleFocusMode()
          addAdaptationUsed('stress-triggered-focus-mode')
          announceToScreenReader('Focus mode activated to reduce distractions')
        }
      })

      if (!preferences.reducedMotion) {
        suggestions.push({
          id: 'reduce_motion',
          title: 'Reduce Motion',
          description: 'Turn off animations and moving elements',
          action: () => {
            // This would be handled by the accessibility context
            addAdaptationUsed('stress-triggered-reduced-motion')
          }
        })
      }
    }

    if (stressLevel === 'medium' || stressLevel === 'high') {
      const hasFormErrors = patterns.some(p => p.type === 'form_failure')
      if (hasFormErrors) {
        suggestions.push({
          id: 'form_help',
          title: 'Need Help with Forms?',
          description: 'Get clearer instructions and validation hints',
          action: () => {
            addAdaptationUsed('stress-triggered-form-help')
          }
        })
      }

      const hasNavigationIssues = patterns.some(p => p.type === 'rapid_navigation')
      if (hasNavigationIssues) {
        suggestions.push({
          id: 'simplified_nav',
          title: 'Simplify Navigation',
          description: 'Show only essential menu items',
          action: () => {
            addAdaptationUsed('stress-triggered-simplified-nav')
          }
        })
      }
    }

    if (suggestions.length > 0) {
      dispatch({ type: actionTypes.CLEAR_SUGGESTIONS })
      suggestions.forEach(suggestion => {
        dispatch({ type: actionTypes.ADD_SUGGESTION, payload: suggestion })
      })
      dispatch({ type: actionTypes.SHOW_SUGGESTION_MODAL })
    }
  }, [preferences, toggleFocusMode, addAdaptationUsed, announceToScreenReader])

  // Recalculate stress level when patterns change
  useEffect(() => {
    calculateStressLevel()
  }, [state.detectedPatterns, calculateStressLevel])

  // Action creators
  const hideSuggestionModal = () => {
    dispatch({ type: actionTypes.HIDE_SUGGESTION_MODAL })
  }

  const resetSession = () => {
    dispatch({ type: actionTypes.RESET_SESSION })
  }

  const value = {
    // State
    ...state,
    
    // Actions
    trackPageView,
    trackInteraction,
    hideSuggestionModal,
    resetSession,
  }

  return (
    <StressDetectionContext.Provider value={value}>
      {children}
    </StressDetectionContext.Provider>
  )
}

// Custom hook to use the context
export function useStressDetection() {
  const context = useContext(StressDetectionContext)
  if (!context) {
    throw new Error('useStressDetection must be used within a StressDetectionProvider')
  }
  return context
}

export default StressDetectionContext
