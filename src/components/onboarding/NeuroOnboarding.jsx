import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useAnalytics } from '../../hooks/useApi'
import apiService from '../../services/api'

const NeuroOnboarding = ({ onComplete }) => {
  const { user } = useAuth()
  const { updatePreferences } = useAccessibility()
  const analytics = useAnalytics()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    // Visual preferences
    fontSize: 'medium',
    highContrast: false,
    colorBlindSupport: 'none',
    reducedMotion: false,
    
    // Cognitive preferences
    simplifiedLayout: false,
    focusMode: false,
    readingGuide: false,
    
    // Interaction preferences
    keyboardNavigation: false,
    voiceControl: false,
    reducedSounds: false,
    noFlashing: false,
    
    // Neurodiversity-specific
    adhdSupport: false,
    autismSupport: false,
    dyslexiaSupport: false,
    anxietySupport: false,
    processingSpeedSupport: false,
    
    // Shopping preferences
    distractionFreeCheckout: false,
    extendedTimeouts: false,
    simplifiedNavigation: false,
    stressDetection: true
  })

  const steps = [
    {
      title: "Welcome to SenseEase! 🌟",
      subtitle: "Let's personalize your shopping experience",
      content: "WelcomeStep"
    },
    {
      title: "Visual Preferences",
      subtitle: "How would you like things to look?",
      content: "VisualStep"
    },
    {
      title: "Cognitive Support",
      subtitle: "What helps you focus and understand?",
      content: "CognitiveStep"
    },
    {
      title: "Neurodiversity Support",
      subtitle: "Tell us about your specific needs",
      content: "NeuroStep"
    },
    {
      title: "Shopping Preferences",
      subtitle: "How do you prefer to shop?",
      content: "ShoppingStep"
    },
    {
      title: "All Set! 🎉",
      subtitle: "Your personalized experience is ready",
      content: "CompletionStep"
    }
  ]

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      analytics.trackEvent('onboarding_step_completed', {
        step: currentStep,
        stepName: steps[currentStep].content
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      // Update accessibility preferences
      updatePreferences(preferences)
      
      // Save to backend if user is authenticated
      if (user) {
        await apiService.updateAccessibilityPreferences(preferences)
        await apiService.completeOnboarding({ accessibilityPreferences: preferences })
      }

      // Track completion
      analytics.trackEvent('onboarding_completed', {
        preferences,
        totalSteps: steps.length
      })

      onComplete(preferences)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🛍️</div>
      <p className="text-lg text-gray-700 leading-relaxed">
        SenseEase is designed to be accessible and comfortable for everyone, 
        especially those with neurodivergent needs.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 This setup takes about 2 minutes and will make your shopping experience 
          much more comfortable. You can change these settings anytime!
        </p>
      </div>
    </div>
  )

  const VisualStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Size
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => updatePreference('fontSize', size)}
              className={`p-3 border rounded-lg text-center ${
                preferences.fontSize === size
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className={`${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'}`}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => updatePreference('highContrast', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>High contrast colors (easier to see)</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Vision Support
        </label>
        <select
          value={preferences.colorBlindSupport}
          onChange={(e) => updatePreference('colorBlindSupport', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="none">No color vision issues</option>
          <option value="deuteranopia">Red-green colorblind (common)</option>
          <option value="protanopia">Red-green colorblind (rare)</option>
          <option value="tritanopia">Blue-yellow colorblind</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Reduce animations and movement</span>
        </label>
      </div>
    </div>
  )

  const CognitiveStep = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.simplifiedLayout}
            onChange={(e) => updatePreference('simplifiedLayout', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Simplified layout (fewer elements, cleaner design)</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.focusMode}
            onChange={(e) => updatePreference('focusMode', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Focus mode (hide distracting elements)</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.readingGuide}
            onChange={(e) => updatePreference('readingGuide', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Reading guide (highlight current line)</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.keyboardNavigation}
            onChange={(e) => updatePreference('keyboardNavigation', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Enhanced keyboard navigation</span>
        </label>
      </div>
    </div>
  )

  const NeuroStep = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-4">
        Select any that apply to you. This helps us provide better support:
      </p>

      <div className="grid grid-cols-1 gap-4">
        <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={preferences.adhdSupport}
            onChange={(e) => updatePreference('adhdSupport', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">ADHD Support</div>
            <div className="text-sm text-gray-600">Reduce distractions, improve focus</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={preferences.autismSupport}
            onChange={(e) => updatePreference('autismSupport', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">Autism Support</div>
            <div className="text-sm text-gray-600">Predictable layout, clear instructions</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={preferences.dyslexiaSupport}
            onChange={(e) => updatePreference('dyslexiaSupport', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">Dyslexia Support</div>
            <div className="text-sm text-gray-600">Dyslexia-friendly fonts, better spacing</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={preferences.anxietySupport}
            onChange={(e) => updatePreference('anxietySupport', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">Anxiety Support</div>
            <div className="text-sm text-gray-600">Calming colors, no time pressure</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={preferences.processingSpeedSupport}
            onChange={(e) => updatePreference('processingSpeedSupport', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">Processing Speed Support</div>
            <div className="text-sm text-gray-600">More time, simpler steps</div>
          </div>
        </label>
      </div>
    </div>
  )

  const ShoppingStep = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.distractionFreeCheckout}
            onChange={(e) => updatePreference('distractionFreeCheckout', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Distraction-free checkout (no ads, timers, or pressure)</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.stressDetection}
            onChange={(e) => updatePreference('stressDetection', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Smart stress detection (we'll offer help if you seem frustrated)</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.extendedTimeouts}
            onChange={(e) => updatePreference('extendedTimeouts', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Extended session timeouts (no rush!)</span>
        </label>
      </div>
    </div>
  )

  const CompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      <p className="text-lg text-gray-700">
        Perfect! Your personalized shopping experience is ready.
      </p>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          ✨ You can always adjust these settings later in your profile or using 
          the accessibility toolbar.
        </p>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case 'WelcomeStep': return <WelcomeStep />
      case 'VisualStep': return <VisualStep />
      case 'CognitiveStep': return <CognitiveStep />
      case 'NeuroStep': return <NeuroStep />
      case 'ShoppingStep': return <ShoppingStep />
      case 'CompletionStep': return <CompletionStep />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600 mb-6">
            {steps[currentStep].subtitle}
          </p>
          
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={completeOnboarding}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Shopping! 🛍️
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NeuroOnboarding
