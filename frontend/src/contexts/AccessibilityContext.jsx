import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AccessibilityContext = createContext()

// Action types
const actionTypes = {
  SET_THEME: 'SET_THEME',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_FONT_FAMILY: 'SET_FONT_FAMILY',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  TOGGLE_REDUCED_MOTION: 'TOGGLE_REDUCED_MOTION',
  TOGGLE_FOCUS_MODE: 'TOGGLE_FOCUS_MODE',
  SET_COLOR_BLIND_SUPPORT: 'SET_COLOR_BLIND_SUPPORT',
  TOGGLE_READING_GUIDE: 'TOGGLE_READING_GUIDE',
  TOGGLE_KEYBOARD_NAVIGATION: 'TOGGLE_KEYBOARD_NAVIGATION',
  SET_NEURODIVERSITY_SUPPORT: 'SET_NEURODIVERSITY_SUPPORT',
  TOGGLE_MOTOR_IMPAIRMENT_SUPPORT: 'TOGGLE_MOTOR_IMPAIRMENT_SUPPORT',
  TOGGLE_COGNITIVE_SUPPORT: 'TOGGLE_COGNITIVE_SUPPORT',
  TOGGLE_STRESS_DETECTION: 'TOGGLE_STRESS_DETECTION',
  SET_STRESS_LEVEL: 'SET_STRESS_LEVEL',
  TOGGLE_CALMING_MODE: 'TOGGLE_CALMING_MODE',
  RESET_SETTINGS: 'RESET_SETTINGS'
}

// Initial state
const initialState = {
  // Visual preferences
  theme: 'default', // default, high-contrast, low-saturation
  fontSize: 'medium', // small, medium, large, extra-large
  fontFamily: 'inter', // inter, dyslexic
  highContrast: false,
  reducedMotion: false,
  colorBlindSupport: 'none', // none, protanopia, deuteranopia, tritanopia

  // Cognitive preferences
  focusMode: false,
  readingGuide: false,
  simplifiedLayout: false,
  cognitiveSupport: false,

  // Motor preferences
  keyboardNavigation: false,
  voiceControl: false,
  motorImpairmentSupport: false,

  // Neurodiversity support
  adhdSupport: false,
  autismSupport: false,
  dyslexiaSupport: false,

  // Sensory preferences
  reducedSounds: false,
  noFlashing: false,

  // Stress detection and calming
  stressDetection: false,
  stressLevel: 0,
  calmingMode: false,

  // Advanced features
  distractionFree: false,
  textHighlight: false,
  readingRuler: false
}

// Reducer function
function accessibilityReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_THEME:
      return { ...state, theme: action.payload }
    
    case actionTypes.SET_FONT_SIZE:
      return { ...state, fontSize: action.payload }
    
    case actionTypes.SET_FONT_FAMILY:
      return { ...state, fontFamily: action.payload }
    
    case actionTypes.TOGGLE_HIGH_CONTRAST:
      return { 
        ...state, 
        highContrast: !state.highContrast,
        theme: !state.highContrast ? 'high-contrast' : 'default'
      }
    
    case actionTypes.TOGGLE_REDUCED_MOTION:
      return { ...state, reducedMotion: !state.reducedMotion }
    
    case actionTypes.TOGGLE_FOCUS_MODE:
      return { ...state, focusMode: !state.focusMode }
    
    case actionTypes.SET_COLOR_BLIND_SUPPORT:
      return { ...state, colorBlindSupport: action.payload }
    
    case actionTypes.TOGGLE_READING_GUIDE:
      return { ...state, readingGuide: !state.readingGuide }
    
    case actionTypes.TOGGLE_KEYBOARD_NAVIGATION:
      return { ...state, keyboardNavigation: !state.keyboardNavigation }
    
    case actionTypes.SET_NEURODIVERSITY_SUPPORT:
      return { ...state, ...action.payload }

    case actionTypes.TOGGLE_MOTOR_IMPAIRMENT_SUPPORT:
      return { ...state, motorImpairmentSupport: !state.motorImpairmentSupport }

    case actionTypes.TOGGLE_COGNITIVE_SUPPORT:
      return { ...state, cognitiveSupport: !state.cognitiveSupport }

    case actionTypes.TOGGLE_STRESS_DETECTION:
      return { ...state, stressDetection: !state.stressDetection }

    case actionTypes.SET_STRESS_LEVEL:
      return { ...state, stressLevel: action.payload }

    case actionTypes.TOGGLE_CALMING_MODE:
      return { ...state, calmingMode: !state.calmingMode }

    case actionTypes.RESET_SETTINGS:
      return initialState

    default:
      return state
  }
}

// Provider component
export function AccessibilityProvider({ children }) {
  const [state, dispatch] = useReducer(accessibilityReducer, initialState)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('senseease-accessibility')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        Object.keys(settings).forEach(key => {
          if (key in initialState) {
            dispatch({ type: `SET_${key.toUpperCase()}`, payload: settings[key] })
          }
        })
      } catch (error) {
        console.error('Error loading accessibility settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('senseease-accessibility', JSON.stringify(state))
  }, [state])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Remove all accessibility classes
    body.classList.remove(
      'theme-high-contrast',
      'theme-low-saturation',
      'font-dyslexic',
      'text-size-small',
      'text-size-medium',
      'text-size-large',
      'text-size-extra-large',
      'reduced-motion',
      'focus-mode',
      'reading-guide',
      'keyboard-navigation',
      'adhd-support',
      'autism-support',
      'dyslexia-support',
      'motor-impairment-support',
      'cognitive-support',
      'stress-detected',
      'calming-mode',
      'colorblind-protanopia-css',
      'colorblind-deuteranopia-css',
      'colorblind-tritanopia-css',
      'adhd-distraction-free',
      'autism-sensory-friendly',
      'dyslexia-friendly'
    )

    // Apply theme
    if (state.theme === 'high-contrast' || state.highContrast) {
      body.classList.add('theme-high-contrast')
    } else if (state.theme === 'low-saturation') {
      body.classList.add('theme-low-saturation')
    }

    // Apply font family
    if (state.fontFamily === 'dyslexic' || state.dyslexiaSupport) {
      body.classList.add('font-dyslexic')
    }

    // Apply font size
    body.classList.add(`text-size-${state.fontSize}`)

    // Apply color blind support
    if (state.colorBlindSupport !== 'none') {
      body.classList.add(`colorblind-${state.colorBlindSupport}-css`)
    }

    // Apply other settings
    if (state.reducedMotion) body.classList.add('reduced-motion')
    if (state.focusMode) body.classList.add('focus-mode')
    if (state.readingGuide) body.classList.add('reading-guide')
    if (state.keyboardNavigation) body.classList.add('keyboard-navigation')

    // Apply neurodiversity support
    if (state.adhdSupport) {
      body.classList.add('adhd-support')
      if (state.distractionFree) body.classList.add('adhd-distraction-free')
    }
    if (state.autismSupport) {
      body.classList.add('autism-support', 'autism-sensory-friendly')
    }
    if (state.dyslexiaSupport) {
      body.classList.add('dyslexia-support', 'dyslexia-friendly')
    }
    if (state.motorImpairmentSupport) {
      body.classList.add('motor-impairment-support')
    }
    if (state.cognitiveSupport) {
      body.classList.add('cognitive-support')
    }

    // Apply stress and calming modes
    if (state.stressLevel > 7) {
      body.classList.add('stress-detected')
    }
    if (state.calmingMode) {
      body.classList.add('calming-mode')
    }

    // Set CSS custom properties
    root.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(state.fontSize))
    
    // Color blind support
    if (state.colorBlindSupport !== 'none') {
      root.style.setProperty('--color-blind-filter', getColorBlindFilter(state.colorBlindSupport))
    } else {
      root.style.removeProperty('--color-blind-filter')
    }

    // Reduced motion
    if (state.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }
  }, [state])

  // Helper functions
  const getFontSizeMultiplier = (size) => {
    switch (size) {
      case 'small': return '0.875'
      case 'medium': return '1'
      case 'large': return '1.125'
      case 'extra-large': return '1.25'
      default: return '1'
    }
  }

  const getColorBlindFilter = (type) => {
    switch (type) {
      case 'protanopia': return 'url(#protanopia)'
      case 'deuteranopia': return 'url(#deuteranopia)'
      case 'tritanopia': return 'url(#tritanopia)'
      default: return 'none'
    }
  }

  // Action creators
  const setTheme = (theme) => dispatch({ type: actionTypes.SET_THEME, payload: theme })
  const setFontSize = (size) => dispatch({ type: actionTypes.SET_FONT_SIZE, payload: size })
  const setFontFamily = (family) => dispatch({ type: actionTypes.SET_FONT_FAMILY, payload: family })
  const toggleHighContrast = () => dispatch({ type: actionTypes.TOGGLE_HIGH_CONTRAST })
  const toggleReducedMotion = () => dispatch({ type: actionTypes.TOGGLE_REDUCED_MOTION })
  const toggleFocusMode = () => dispatch({ type: actionTypes.TOGGLE_FOCUS_MODE })
  const setColorBlindSupport = (type) => dispatch({ type: actionTypes.SET_COLOR_BLIND_SUPPORT, payload: type })
  const toggleReadingGuide = () => dispatch({ type: actionTypes.TOGGLE_READING_GUIDE })
  const toggleKeyboardNavigation = () => dispatch({ type: actionTypes.TOGGLE_KEYBOARD_NAVIGATION })
  const setNeurodiversitySupport = (settings) => dispatch({ type: actionTypes.SET_NEURODIVERSITY_SUPPORT, payload: settings })
  const toggleMotorImpairmentSupport = () => dispatch({ type: actionTypes.TOGGLE_MOTOR_IMPAIRMENT_SUPPORT })
  const toggleCognitiveSupport = () => dispatch({ type: actionTypes.TOGGLE_COGNITIVE_SUPPORT })
  const toggleStressDetection = () => dispatch({ type: actionTypes.TOGGLE_STRESS_DETECTION })
  const setStressLevel = (level) => dispatch({ type: actionTypes.SET_STRESS_LEVEL, payload: level })
  const toggleCalmingMode = () => dispatch({ type: actionTypes.TOGGLE_CALMING_MODE })
  const resetSettings = () => dispatch({ type: actionTypes.RESET_SETTINGS })

  const value = {
    // State
    ...state,

    // Actions
    setTheme,
    setFontSize,
    setFontFamily,
    toggleHighContrast,
    toggleReducedMotion,
    toggleFocusMode,
    setColorBlindSupport,
    toggleReadingGuide,
    toggleKeyboardNavigation,
    setNeurodiversitySupport,
    toggleMotorImpairmentSupport,
    toggleCognitiveSupport,
    toggleStressDetection,
    setStressLevel,
    toggleCalmingMode,
    resetSettings
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// Custom hook to use the context
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

export default AccessibilityContext
