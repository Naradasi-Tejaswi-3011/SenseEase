import React, { useState } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useAnalytics } from '../hooks/useApi'
import {
  Settings,
  Eye,
  Type,
  Palette,
  Volume2,
  Focus,
  ChevronRight,
  ChevronLeft,
  X,
  Brain,
  Heart,
  Zap,
  Shield
} from 'lucide-react'

const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  
  const {
    preferences,
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
    announceToScreenReader
  } = useAccessibility()

  const { addAdaptationUsed } = useUserProfile()
  const { trackEvent } = useAnalytics()

  const toggleToolbar = () => {
    setIsOpen(!isOpen)
    setActivePanel(null)
    if (!isOpen) {
      announceToScreenReader('Accessibility toolbar opened')
    } else {
      announceToScreenReader('Accessibility toolbar closed')
    }
  }

  const handleToggle = (toggleFunction, adaptationName, description) => {
    toggleFunction()
    addAdaptationUsed(adaptationName)
    announceToScreenReader(description)

    // Track accessibility usage
    trackEvent('accessibility_usage', {
      feature: adaptationName,
      enabled: !preferences[adaptationName.replace('-', '').toLowerCase()],
      timestamp: Date.now()
    })
  }

  const panels = {
    vision: {
      title: 'Vision',
      icon: Eye,
      options: [
        {
          id: 'highContrast',
          label: 'High Contrast',
          description: 'Increase contrast for better visibility',
          active: preferences.highContrast,
          toggle: () => handleToggle(toggleHighContrast, 'high-contrast', 
            preferences.highContrast ? 'High contrast disabled' : 'High contrast enabled')
        },
        {
          id: 'lowSaturation',
          label: 'Low Saturation',
          description: 'Reduce color intensity',
          active: preferences.lowSaturation,
          toggle: () => handleToggle(toggleLowSaturation, 'low-saturation',
            preferences.lowSaturation ? 'Low saturation disabled' : 'Low saturation enabled')
        },
        {
          id: 'colorblind',
          label: 'Colorblind Mode',
          description: 'Simulate different types of color vision',
          type: 'select',
          value: preferences.colorblindType || '',
          options: [
            { value: '', label: 'None' },
            { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
            { value: 'protanopia', label: 'Protanopia (Red-blind)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
          ],
          onChange: (value) => {
            setColorblindMode(value)
            addAdaptationUsed(`colorblind-${value}`)
            announceToScreenReader(value ? `Colorblind mode set to ${value}` : 'Colorblind mode disabled')
          }
        }
      ]
    },
    text: {
      title: 'Text',
      icon: Type,
      options: [
        {
          id: 'dyslexicFont',
          label: 'Dyslexia-Friendly Font',
          description: 'Use OpenDyslexic font for better readability',
          active: preferences.dyslexicFont,
          toggle: () => handleToggle(toggleDyslexicFont, 'dyslexic-font',
            preferences.dyslexicFont ? 'Dyslexic font disabled' : 'Dyslexic font enabled')
        },
        {
          id: 'textSize',
          label: 'Text Size',
          description: 'Adjust text size for better readability',
          type: 'select',
          value: preferences.textSize,
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' }
          ],
          onChange: (value) => {
            setTextSize(value)
            addAdaptationUsed(`text-size-${value}`)
            announceToScreenReader(`Text size set to ${value}`)
          }
        }
      ]
    },
    motion: {
      title: 'Motion',
      icon: Focus,
      options: [
        {
          id: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimize animations and movement',
          active: preferences.reducedMotion,
          toggle: () => handleToggle(toggleReducedMotion, 'reduced-motion',
            preferences.reducedMotion ? 'Reduced motion disabled' : 'Reduced motion enabled')
        },
        {
          id: 'focusMode',
          label: 'Focus Mode',
          description: 'Hide distracting elements',
          active: preferences.focusMode,
          toggle: () => handleToggle(toggleFocusMode, 'focus-mode',
            preferences.focusMode ? 'Focus mode disabled' : 'Focus mode enabled')
        }
      ]
    },
    adhd: {
      title: 'ADHD Support',
      icon: Zap,
      options: [
        {
          id: 'hideCarousels',
          label: 'Hide Moving Elements',
          description: 'Remove carousels and auto-playing content',
          active: preferences.hideCarousels,
          toggle: () => handleToggle(toggleHideCarousels, 'hide-carousels',
            preferences.hideCarousels ? 'Moving elements shown' : 'Moving elements hidden')
        },
        {
          id: 'hideTimers',
          label: 'Hide Countdown Timers',
          description: 'Remove time pressure elements',
          active: preferences.hideTimers,
          toggle: () => handleToggle(toggleHideTimers, 'hide-timers',
            preferences.hideTimers ? 'Timers shown' : 'Timers hidden')
        },
        {
          id: 'focusMode',
          label: 'Focus Mode',
          description: 'Minimize distractions and simplify interface',
          active: preferences.focusMode,
          toggle: () => handleToggle(toggleFocusMode, 'focus-mode',
            preferences.focusMode ? 'Focus mode disabled' : 'Focus mode enabled')
        }
      ]
    },
    autism: {
      title: 'Autism Support',
      icon: Heart,
      options: [
        {
          id: 'simplifiedNavigation',
          label: 'Simplified Navigation',
          description: 'Reduce menu complexity and options',
          active: preferences.simplifiedNavigation,
          toggle: () => handleToggle(toggleSimplifiedNavigation, 'simplified-nav',
            preferences.simplifiedNavigation ? 'Full navigation restored' : 'Navigation simplified')
        },
        {
          id: 'hidePopups',
          label: 'Block Unexpected Popups',
          description: 'Prevent sudden interface changes',
          active: preferences.hidePopups,
          toggle: () => handleToggle(toggleHidePopups, 'hide-popups',
            preferences.hidePopups ? 'Popups enabled' : 'Popups blocked')
        },
        {
          id: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimize animations and transitions',
          active: preferences.reducedMotion,
          toggle: () => handleToggle(toggleReducedMotion, 'reduced-motion',
            preferences.reducedMotion ? 'Motion restored' : 'Motion reduced')
        }
      ]
    },
    sensory: {
      title: 'Sensory Support',
      icon: Shield,
      options: [
        {
          id: 'lowSaturation',
          label: 'Reduce Color Intensity',
          description: 'Lower saturation for sensory comfort',
          active: preferences.lowSaturation,
          toggle: () => handleToggle(toggleLowSaturation, 'low-saturation',
            preferences.lowSaturation ? 'Full colors restored' : 'Colors reduced')
        },
        {
          id: 'highContrast',
          label: 'High Contrast',
          description: 'Increase contrast for better definition',
          active: preferences.highContrast,
          toggle: () => handleToggle(toggleHighContrast, 'high-contrast',
            preferences.highContrast ? 'Normal contrast restored' : 'High contrast enabled')
        }
      ]
    }
  }

  return (
    <>
      {/* Toolbar Toggle Button */}
      <button
        onClick={toggleToolbar}
        className={`
          fixed right-4 top-20 z-50 p-3 rounded-full shadow-lg transition-all duration-300
          ${isOpen 
            ? 'bg-walmart-blue text-white' 
            : 'bg-white text-walmart-blue border-2 border-walmart-blue hover:bg-blue-50'
          }
        `}
        aria-label="Toggle accessibility toolbar"
        data-accessibility-toolbar
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div className="fixed right-4 top-36 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Accessibility</h2>
            <button
              onClick={toggleToolbar}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close accessibility toolbar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Panel or Sub-panel */}
          {!activePanel ? (
            // Main panel with categories
            <div className="p-4 space-y-2">
              {Object.entries(panels).map(([key, panel]) => {
                const IconComponent = panel.icon
                return (
                  <button
                    key={key}
                    onClick={() => setActivePanel(key)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{panel.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )
              })}
              
              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleToggle(toggleFocusMode, 'focus-mode',
                      preferences.focusMode ? 'Focus mode disabled' : 'Focus mode enabled')}
                    className={`
                      w-full p-2 text-sm rounded-lg transition-colors
                      ${preferences.focusMode
                        ? 'bg-walmart-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {preferences.focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Sub-panel with specific options
            <div>
              {/* Sub-panel header */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Back to main menu"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {panels[activePanel].title}
                </h3>
              </div>

              {/* Sub-panel options */}
              <div className="p-4 space-y-4">
                {panels[activePanel].options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          {option.label}
                        </label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                      
                      {option.type === 'select' ? (
                        <select
                          value={option.value}
                          onChange={(e) => option.onChange(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue"
                        >
                          {option.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={option.toggle}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${option.active ? 'bg-walmart-blue' : 'bg-gray-200'}
                          `}
                          aria-pressed={option.active}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${option.active ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={toggleToolbar}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default AccessibilityToolbar
