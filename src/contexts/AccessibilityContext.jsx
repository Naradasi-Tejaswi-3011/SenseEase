import React, { createContext, useContext, useEffect } from 'react'
import { useUserProfile } from './UserProfileContext'

const AccessibilityContext = createContext()

// Provider component
export function AccessibilityProvider({ children }) {
  const { preferences, updatePreference, addAdaptationUsed } = useUserProfile()

  // Apply accessibility preferences to the document
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Apply theme classes
    if (preferences.highContrast) {
      body.classList.add('theme-high-contrast')
      addAdaptationUsed('high-contrast')
    } else {
      body.classList.remove('theme-high-contrast')
    }

    if (preferences.lowSaturation) {
      body.classList.add('theme-low-saturation')
      addAdaptationUsed('low-saturation')
    } else {
      body.classList.remove('theme-low-saturation')
    }

    if (preferences.focusMode) {
      body.classList.add('focus-mode')
      addAdaptationUsed('focus-mode')
    } else {
      body.classList.remove('focus-mode')
    }

    if (preferences.dyslexicFont) {
      body.classList.add('font-dyslexic')
      addAdaptationUsed('dyslexic-font')
    } else {
      body.classList.remove('font-dyslexic')
    }

    // Apply text size
    body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-extra-large')
    body.classList.add(`text-size-${preferences.textSize}`)

    // Apply reduced motion
    if (preferences.reducedMotion) {
      body.classList.add('reduced-motion')
      addAdaptationUsed('reduced-motion')
    } else {
      body.classList.remove('reduced-motion')
    }

    // Set CSS custom properties for colorblind simulation
    if (preferences.isColorblind && preferences.colorblindType) {
      root.style.setProperty('--colorblind-filter', getColorblindFilter(preferences.colorblindType))
      addAdaptationUsed(`colorblind-${preferences.colorblindType}`)
    } else {
      root.style.removeProperty('--colorblind-filter')
    }

  }, [preferences, addAdaptationUsed])

  // Colorblind filter CSS filters
  const getColorblindFilter = (type) => {
    const filters = {
      deuteranopia: 'url(#deuteranopia)',
      protanopia: 'url(#protanopia)',
      tritanopia: 'url(#tritanopia)',
    }
    return filters[type] || 'none'
  }

  // Toggle functions
  const toggleHighContrast = () => {
    updatePreference('highContrast', !preferences.highContrast)
  }

  const toggleLowSaturation = () => {
    updatePreference('lowSaturation', !preferences.lowSaturation)
  }

  const toggleDyslexicFont = () => {
    updatePreference('dyslexicFont', !preferences.dyslexicFont)
  }

  const toggleReducedMotion = () => {
    updatePreference('reducedMotion', !preferences.reducedMotion)
  }

  const toggleFocusMode = () => {
    updatePreference('focusMode', !preferences.focusMode)
  }

  const setTextSize = (size) => {
    updatePreference('textSize', size)
  }

  const setColorblindMode = (type) => {
    updatePreference('isColorblind', !!type)
    updatePreference('colorblindType', type)
  }

  const toggleHideCarousels = () => {
    updatePreference('hideCarousels', !preferences.hideCarousels)
  }

  const toggleHidePopups = () => {
    updatePreference('hidePopups', !preferences.hidePopups)
  }

  const toggleHideTimers = () => {
    updatePreference('hideTimers', !preferences.hideTimers)
  }

  const toggleSimplifiedNavigation = () => {
    updatePreference('simplifiedNavigation', !preferences.simplifiedNavigation)
  }

  // Keyboard navigation helpers
  const handleKeyboardNavigation = (event) => {
    // Skip to main content with Alt+M
    if (event.altKey && event.key === 'm') {
      event.preventDefault()
      const main = document.querySelector('main')
      if (main) {
        main.focus()
        main.scrollIntoView()
      }
    }

    // Toggle focus mode with Alt+F
    if (event.altKey && event.key === 'f') {
      event.preventDefault()
      toggleFocusMode()
    }

    // Toggle accessibility toolbar with Alt+A
    if (event.altKey && event.key === 'a') {
      event.preventDefault()
      const toolbar = document.querySelector('[data-accessibility-toolbar]')
      if (toolbar) {
        toolbar.focus()
      }
    }
  }

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation)
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }
  }, [])

  // Screen reader announcements
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const value = {
    // State
    preferences,
    
    // Toggle functions
    toggleHighContrast,
    toggleLowSaturation,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleFocusMode,
    setTextSize,
    setColorblindMode,
    toggleHideCarousels,
    toggleHidePopups,
    toggleHideTimers,
    toggleSimplifiedNavigation,
    
    // Utility functions
    announceToScreenReader,
    getColorblindFilter,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* SVG filters for colorblind simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
          </filter>
          <filter id="protanopia">
            <feColorMatrix values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
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
