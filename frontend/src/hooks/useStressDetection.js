import { useState, useEffect, useCallback } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'

export const useStressDetection = () => {
  const { stressDetection, setStressLevel, toggleCalmingMode } = useAccessibility()
  const [interactionHistory, setInteractionHistory] = useState([])
  const [lastInteraction, setLastInteraction] = useState(Date.now())

  // Stress indicators
  const [rapidClicks, setRapidClicks] = useState(0)
  const [backtrackingCount, setBacktrackingCount] = useState(0)
  const [hesitationTime, setHesitationTime] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  const calculateStressLevel = useCallback(() => {
    if (!stressDetection) return 0

    let stress = 0
    const now = Date.now()
    const recentInteractions = interactionHistory.filter(
      interaction => now - interaction.timestamp < 60000 // Last minute
    )

    // Rapid clicking indicator
    const clicksPerMinute = recentInteractions.filter(i => i.type === 'click').length
    if (clicksPerMinute > 20) stress += 2
    else if (clicksPerMinute > 10) stress += 1

    // Backtracking indicator (going back and forth between pages)
    const pageChanges = recentInteractions.filter(i => i.type === 'navigation')
    const uniquePages = new Set(pageChanges.map(i => i.page))
    if (pageChanges.length > uniquePages.size * 2) stress += 2

    // Hesitation indicator (long pauses between interactions)
    const avgTimeBetweenInteractions = recentInteractions.length > 1 
      ? recentInteractions.reduce((sum, interaction, index) => {
          if (index === 0) return 0
          return sum + (interaction.timestamp - recentInteractions[index - 1].timestamp)
        }, 0) / (recentInteractions.length - 1)
      : 0

    if (avgTimeBetweenInteractions > 10000) stress += 1 // More than 10 seconds
    if (avgTimeBetweenInteractions > 30000) stress += 2 // More than 30 seconds

    // Form errors indicator
    const formErrors = recentInteractions.filter(i => i.type === 'form_error').length
    stress += Math.min(formErrors, 3)

    // Mouse movement patterns (erratic movement)
    const mouseMovements = recentInteractions.filter(i => i.type === 'mouse_move')
    if (mouseMovements.length > 100) stress += 1 // Too much mouse movement

    // Scroll patterns (excessive scrolling)
    const scrollEvents = recentInteractions.filter(i => i.type === 'scroll')
    if (scrollEvents.length > 50) stress += 1

    return Math.min(stress, 10) // Cap at 10
  }, [interactionHistory, stressDetection])

  const recordInteraction = useCallback((type, data = {}) => {
    if (!stressDetection) return

    const interaction = {
      type,
      timestamp: Date.now(),
      ...data
    }

    setInteractionHistory(prev => {
      const updated = [...prev, interaction].slice(-200) // Keep last 200 interactions
      return updated
    })

    setLastInteraction(Date.now())
  }, [stressDetection])

  // Auto-calculate stress level
  useEffect(() => {
    if (!stressDetection) return

    const interval = setInterval(() => {
      const newStressLevel = calculateStressLevel()
      setStressLevel(newStressLevel)

      // Auto-enable calming mode if stress is high
      if (newStressLevel >= 8) {
        toggleCalmingMode()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [stressDetection, calculateStressLevel, setStressLevel, toggleCalmingMode])

  // Event listeners for stress detection
  useEffect(() => {
    if (!stressDetection) return

    const handleClick = (e) => {
      recordInteraction('click', { 
        target: e.target.tagName,
        x: e.clientX,
        y: e.clientY
      })
    }

    const handleMouseMove = (e) => {
      recordInteraction('mouse_move', { 
        x: e.clientX,
        y: e.clientY,
        speed: Math.sqrt(e.movementX ** 2 + e.movementY ** 2)
      })
    }

    const handleScroll = () => {
      recordInteraction('scroll', { 
        scrollY: window.scrollY,
        scrollX: window.scrollX
      })
    }

    const handleKeyPress = (e) => {
      recordInteraction('keypress', { 
        key: e.key,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      })
    }

    const handleFormError = (e) => {
      if (e.target.validity && !e.target.validity.valid) {
        recordInteraction('form_error', { 
          field: e.target.name,
          error: e.target.validationMessage
        })
      }
    }

    // Add event listeners
    document.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('keypress', handleKeyPress)
    document.addEventListener('invalid', handleFormError, true)

    // Navigation tracking
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      recordInteraction('navigation', { page: args[2] || window.location.pathname })
      return originalPushState.apply(this, args)
    }

    history.replaceState = function(...args) {
      recordInteraction('navigation', { page: args[2] || window.location.pathname })
      return originalReplaceState.apply(this, args)
    }

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('keypress', handleKeyPress)
      document.removeEventListener('invalid', handleFormError, true)
      
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [stressDetection, recordInteraction])

  return {
    recordInteraction,
    interactionHistory,
    calculateStressLevel
  }
}

export default useStressDetection
