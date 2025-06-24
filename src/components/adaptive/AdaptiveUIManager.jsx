import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useAuth } from '../../contexts/AuthContext'
import { useAnalytics } from '../../hooks/useApi'
import FocusModePrompt from './FocusModePrompt'
import CalmingMessage from './CalmingMessage'
import SimplifiedNavigationPrompt from './SimplifiedNavigationPrompt'

const AdaptiveUIManager = () => {
  const { preferences, updatePreferences } = useAccessibility()
  const { user } = useAuth()
  const { trackEvent } = useAnalytics()
  
  const [showFocusModePrompt, setShowFocusModePrompt] = useState(false)
  const [showCalmingMessage, setShowCalmingMessage] = useState(false)
  const [showSimplifiedNavPrompt, setShowSimplifiedNavPrompt] = useState(false)
  const [stressLevel, setStressLevel] = useState('low')
  const [adaptationHistory, setAdaptationHistory] = useState([])

  useEffect(() => {
    // Listen for stress detection events
    const handleStressDetected = (event) => {
      const { type, severity, context } = event.detail
      setStressLevel(severity)
      
      // Log stress event
      console.log(`Stress detected: ${type} (${severity})`, context)
      
      // Track adaptation trigger
      trackEvent('adaptation_triggered', {
        stressType: type,
        severity,
        context,
        currentPreferences: preferences
      })
      
      // Add to adaptation history
      setAdaptationHistory(prev => [...prev, {
        timestamp: Date.now(),
        type,
        severity,
        context,
        adaptationApplied: null
      }])
    }

    const handleSuggestFocusMode = (event) => {
      const { triggerType } = event.detail
      
      // Don't show if already in focus mode
      if (preferences.focusMode) return
      
      setShowFocusModePrompt(true)
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowFocusModePrompt(false)
      }, 10000)

      // Store timer for cleanup
      return () => clearTimeout(timer)
    }

    const handleShowCalmingMessage = () => {
      setShowCalmingMessage(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCalmingMessage(false)
      }, 5000)

      // Store timer for cleanup
      return () => clearTimeout(timer)
    }

    const handleSuggestSimplifiedNavigation = () => {
      // Don't show if already simplified
      if (preferences.simplifiedLayout) return
      
      setShowSimplifiedNavPrompt(true)
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowSimplifiedNavPrompt(false)
      }, 8000)

      // Store timer for cleanup
      return () => clearTimeout(timer)
    }

    // Add event listeners
    window.addEventListener('stressDetected', handleStressDetected)
    window.addEventListener('suggestFocusMode', handleSuggestFocusMode)
    window.addEventListener('showCalmingMessage', handleShowCalmingMessage)
    window.addEventListener('suggestSimplifiedNavigation', handleSuggestSimplifiedNavigation)

    return () => {
      window.removeEventListener('stressDetected', handleStressDetected)
      window.removeEventListener('suggestFocusMode', handleSuggestFocusMode)
      window.removeEventListener('showCalmingMessage', handleShowCalmingMessage)
      window.removeEventListener('suggestSimplifiedNavigation', handleSuggestSimplifiedNavigation)
    }
  }, [preferences, trackEvent])

  // Auto-adapt based on stress patterns
  useEffect(() => {
    if (!user) return

    const recentStressEvents = adaptationHistory.filter(
      event => Date.now() - event.timestamp < 300000 // Last 5 minutes
    )

    const highStressEvents = recentStressEvents.filter(
      event => event.severity === 'high'
    )

    // Auto-enable focus mode for repeated high stress
    if (highStressEvents.length >= 2 && !preferences.focusMode) {
      updatePreferences({ focusMode: true })
      
      trackEvent('auto_adaptation_applied', {
        adaptationType: 'focus_mode',
        trigger: 'repeated_high_stress',
        stressEvents: highStressEvents.length
      })

      // Update adaptation history
      setAdaptationHistory(prev => prev.map(event => 
        highStressEvents.includes(event) 
          ? { ...event, adaptationApplied: 'focus_mode_auto' }
          : event
      ))
    }

    // Auto-enable simplified layout for navigation stress
    const navStressEvents = recentStressEvents.filter(
      event => ['rapid_navigation', 'back_button_usage'].includes(event.type)
    )

    if (navStressEvents.length >= 3 && !preferences.simplifiedLayout) {
      updatePreferences({ simplifiedLayout: true })
      
      trackEvent('auto_adaptation_applied', {
        adaptationType: 'simplified_layout',
        trigger: 'navigation_stress',
        stressEvents: navStressEvents.length
      })
    }

    // Auto-enable reduced motion for erratic scrolling
    const scrollStressEvents = recentStressEvents.filter(
      event => event.type === 'erratic_scrolling'
    )

    if (scrollStressEvents.length >= 2 && !preferences.reducedMotion) {
      updatePreferences({ reducedMotion: true })
      
      trackEvent('auto_adaptation_applied', {
        adaptationType: 'reduced_motion',
        trigger: 'erratic_scrolling',
        stressEvents: scrollStressEvents.length
      })
    }
  }, [adaptationHistory, user, preferences, updatePreferences, trackEvent])

  const handleAcceptFocusMode = () => {
    updatePreferences({ focusMode: true })
    setShowFocusModePrompt(false)
    
    trackEvent('adaptation_accepted', {
      adaptationType: 'focus_mode',
      trigger: 'user_prompt'
    })
  }

  const handleDeclineFocusMode = () => {
    setShowFocusModePrompt(false)
    
    trackEvent('adaptation_declined', {
      adaptationType: 'focus_mode',
      trigger: 'user_prompt'
    })
  }

  const handleAcceptSimplifiedNav = () => {
    updatePreferences({ simplifiedLayout: true })
    setShowSimplifiedNavPrompt(false)
    
    trackEvent('adaptation_accepted', {
      adaptationType: 'simplified_layout',
      trigger: 'user_prompt'
    })
  }

  const handleDeclineSimplifiedNav = () => {
    setShowSimplifiedNavPrompt(false)
    
    trackEvent('adaptation_declined', {
      adaptationType: 'simplified_layout',
      trigger: 'user_prompt'
    })
  }

  const handleDismissCalmingMessage = () => {
    setShowCalmingMessage(false)
  }

  return (
    <>
      {/* Focus Mode Prompt */}
      {showFocusModePrompt && (
        <FocusModePrompt
          onAccept={handleAcceptFocusMode}
          onDecline={handleDeclineFocusMode}
          stressLevel={stressLevel}
        />
      )}

      {/* Calming Message */}
      {showCalmingMessage && (
        <CalmingMessage
          onDismiss={handleDismissCalmingMessage}
          stressLevel={stressLevel}
        />
      )}

      {/* Simplified Navigation Prompt */}
      {showSimplifiedNavPrompt && (
        <SimplifiedNavigationPrompt
          onAccept={handleAcceptSimplifiedNav}
          onDecline={handleDeclineSimplifiedNav}
          stressLevel={stressLevel}
        />
      )}

      {/* Stress Level Indicator (for development/debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs z-50">
          Stress Level: {stressLevel}
          <br />
          Recent Events: {adaptationHistory.filter(e => Date.now() - e.timestamp < 60000).length}
        </div>
      )}
    </>
  )
}

export default AdaptiveUIManager
