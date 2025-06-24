import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { CheckCircle, ArrowRight, ArrowLeft, Info } from 'lucide-react'

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { updatePreferences, setOnboarded } = useUserProfile()
  const { announceToScreenReader } = useAccessibility()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    hasADHD: false,
    hasAutism: false,
    hasDyslexia: false,
    hasSensoryIssues: false,
    isColorblind: false,
    colorblindType: null,
    reducedMotion: false,
    highContrast: false,
    lowSaturation: false,
    dyslexicFont: false,
    textSize: 'medium',
    hideCarousels: false,
    hidePopups: false,
    hideTimers: false,
    simplifiedNavigation: false,
    extendedTimeouts: false,
  })

  const steps = [
    {
      title: "Welcome to SenseEase",
      subtitle: "Let's personalize your shopping experience",
      content: "WelcomeStep"
    },
    {
      title: "Tell us about yourself",
      subtitle: "This helps us create a more comfortable experience",
      content: "NeurodiverityStep"
    },
    {
      title: "Visual preferences",
      subtitle: "Customize how content appears on screen",
      content: "VisualStep"
    },
    {
      title: "Interface preferences",
      subtitle: "Choose what elements you'd like to see",
      content: "InterfaceStep"
    },
    {
      title: "You're all set!",
      subtitle: "Your personalized shopping experience is ready",
      content: "CompletionStep"
    }
  ]

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      announceToScreenReader(`Step ${currentStep + 2} of ${steps.length}: ${steps[currentStep + 1].title}`)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      announceToScreenReader(`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].title}`)
    }
  }

  const completeOnboarding = () => {
    updatePreferences(preferences)
    setOnboarded(true)
    announceToScreenReader('Onboarding completed. Redirecting to homepage.')
    navigate('/')
  }

  const skipOnboarding = () => {
    setOnboarded(true)
    navigate('/')
  }

  const WelcomeStep = () => (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-white text-4xl font-bold">SE</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-blue-900 text-lg">✨</span>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SenseEase</h2>
          <p className="text-xl text-blue-600 font-medium">Accessible Shopping for Everyone</p>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          SenseEase makes online shopping more comfortable and accessible for everyone,
          especially those with ADHD, autism, dyslexia, and sensory sensitivities.
          Let's personalize your experience in just a few steps.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Your Privacy Matters</h3>
              <p className="text-blue-800">
                All preferences are stored locally on your device. We don't collect or share your personal information.
                You can change these settings anytime or reset them completely.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl">🧠</span>
            </div>
            <h4 className="font-semibold text-gray-900">Neurodiversity Friendly</h4>
            <p className="text-sm text-gray-600 mt-1">Designed for ADHD, autism, dyslexia, and more</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 text-xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900">Adaptive Interface</h4>
            <p className="text-sm text-gray-600 mt-1">UI changes based on your needs and stress levels</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 text-xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900">Focus Mode</h4>
            <p className="text-sm text-gray-600 mt-1">Distraction-free shopping when you need it</p>
          </div>
        </div>
      </div>
    </div>
  )

  const NeurodiverityStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-lg text-gray-600">This helps us create a more comfortable experience for you</p>
        <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2 inline-block">
          All selections are optional and can be changed anytime
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {[
          {
            key: 'hasADHD',
            label: 'I have ADHD',
            description: 'Easily distracted, need focused interfaces',
            icon: '🧠',
            color: 'blue'
          },
          {
            key: 'hasAutism',
            label: 'I am autistic',
            description: 'Prefer predictable, clear navigation',
            icon: '🌟',
            color: 'purple'
          },
          {
            key: 'hasDyslexia',
            label: 'I have dyslexia',
            description: 'Benefit from dyslexia-friendly fonts',
            icon: '📖',
            color: 'green'
          },
          {
            key: 'hasSensoryIssues',
            label: 'I have sensory sensitivities',
            description: 'Sensitive to bright colors, motion, sounds',
            icon: '🎨',
            color: 'orange'
          },
        ].map(({ key, label, description, icon, color }) => (
          <label
            key={key}
            className={`
              block p-6 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105
              ${preferences[key]
                ? `border-${color}-500 bg-${color}-50 shadow-lg`
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                ${preferences[key] ? `bg-${color}-100` : 'bg-gray-100'}
              `}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                    className={`w-5 h-5 text-${color}-600 border-gray-300 rounded focus:ring-${color}-500`}
                  />
                  <div className="font-semibold text-gray-900 text-lg">{label}</div>
                </div>
                <div className="text-gray-600 mt-2 leading-relaxed">{description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-lg">👁️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Color Vision</h3>
              <p className="text-sm text-gray-600">Help us adjust colors for better visibility</p>
            </div>
          </div>
          <select
            value={preferences.colorblindType || ''}
            onChange={(e) => {
              const value = e.target.value
              handlePreferenceChange('isColorblind', !!value)
              handlePreferenceChange('colorblindType', value || null)
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="">No color vision differences</option>
            <option value="deuteranopia">Deuteranopia (difficulty seeing green)</option>
            <option value="protanopia">Protanopia (difficulty seeing red)</option>
            <option value="tritanopia">Tritanopia (difficulty seeing blue)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const VisualStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Visual preferences</h2>
        <p className="text-lg text-gray-600">Customize how content appears on screen</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📝</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Text Size</h3>
              <p className="text-sm text-gray-600">Choose the most comfortable reading size</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'small', label: 'Small', demo: 'Aa' },
              { value: 'medium', label: 'Medium', demo: 'Aa' },
              { value: 'large', label: 'Large', demo: 'Aa' },
              { value: 'extra-large', label: 'Extra Large', demo: 'Aa' }
            ].map(({ value, label, demo }) => (
              <button
                key={value}
                onClick={() => handlePreferenceChange('textSize', value)}
                className={`
                  p-4 border-2 rounded-xl text-center transition-all transform hover:scale-105
                  ${preferences.textSize === value
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                <div className={`font-bold mb-2 ${
                  value === 'small' ? 'text-lg' :
                  value === 'medium' ? 'text-xl' :
                  value === 'large' ? 'text-2xl' : 'text-3xl'
                }`}>
                  {demo}
                </div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              key: 'dyslexicFont',
              label: 'Dyslexia-friendly font',
              description: 'Use OpenDyslexic font for better readability',
              icon: '📖',
              color: 'green'
            },
            {
              key: 'highContrast',
              label: 'High contrast',
              description: 'Increase contrast for better visibility',
              icon: '🔆',
              color: 'yellow'
            },
            {
              key: 'lowSaturation',
              label: 'Low saturation',
              description: 'Reduce color intensity to prevent overwhelm',
              icon: '🎨',
              color: 'purple'
            },
            {
              key: 'reducedMotion',
              label: 'Reduce motion',
              description: 'Minimize animations and movement',
              icon: '⚡',
              color: 'red'
            },
          ].map(({ key, label, description, icon, color }) => (
            <label
              key={key}
              className={`
                block p-6 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105
                ${preferences[key]
                  ? `border-${color}-500 bg-${color}-50 shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                  ${preferences[key] ? `bg-${color}-100` : 'bg-gray-100'}
                `}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className={`w-5 h-5 text-${color}-600 border-gray-300 rounded focus:ring-${color}-500`}
                    />
                    <div className="font-semibold text-gray-900 text-lg">{label}</div>
                  </div>
                  <div className="text-gray-600 mt-2 leading-relaxed">{description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const InterfaceStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Interface preferences</h2>
        <p className="text-gray-600">Choose what elements you'd like to hide or modify</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {[
            { key: 'hideCarousels', label: 'Hide image carousels', description: 'Remove rotating banners and slideshows' },
            { key: 'hidePopups', label: 'Hide pop-ups', description: 'Block promotional pop-ups and overlays' },
            { key: 'hideTimers', label: 'Hide countdown timers', description: 'Remove time pressure elements' },
            { key: 'simplifiedNavigation', label: 'Simplified navigation', description: 'Show only essential menu items' },
            { key: 'extendedTimeouts', label: 'Extended timeouts', description: 'More time for forms and checkout' },
          ].map(({ key, label, description }) => (
            <label
              key={key}
              className={`
                block p-4 border-2 rounded-lg cursor-pointer transition-all
                ${preferences[key] 
                  ? 'border-walmart-blue bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                  className="mt-1 w-4 h-4 text-walmart-blue border-gray-300 rounded focus:ring-walmart-blue"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600 mt-1">{description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const CompletionStep = () => (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-2xl">🎉</span>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">You're all set!</h2>
          <p className="text-xl text-green-600 font-medium">Your personalized experience is ready</p>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          SenseEase has been customized based on your preferences. You can always adjust these
          settings later from your profile or using the accessibility toolbar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">⌨️</span>
              </div>
              <h3 className="font-semibold text-green-900">Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <div><kbd className="bg-green-200 px-2 py-1 rounded">Alt + A</kbd> Open accessibility toolbar</div>
              <div><kbd className="bg-green-200 px-2 py-1 rounded">Alt + F</kbd> Toggle focus mode</div>
              <div><kbd className="bg-green-200 px-2 py-1 rounded">Alt + M</kbd> Skip to main content</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🛠️</span>
              </div>
              <h3 className="font-semibold text-blue-900">What's Next?</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• Browse products with your personalized interface</div>
              <div>• Try focus mode for distraction-free shopping</div>
              <div>• Adjust settings anytime from your profile</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">💡</span>
            </div>
            <h3 className="font-semibold text-yellow-900">Smart Adaptations</h3>
          </div>
          <p className="text-yellow-800">
            SenseEase will learn from your shopping patterns and automatically suggest helpful
            adaptations when it detects stress or confusion. You're always in control!
          </p>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case 'WelcomeStep': return <WelcomeStep />
      case 'NeurodiverityStep': return <NeurodiverityStep />
      case 'VisualStep': return <VisualStep />
      case 'InterfaceStep': return <InterfaceStep />
      case 'CompletionStep': return <CompletionStep />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">SE</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="text-sm text-gray-600">{steps[currentStep].subtitle}</div>
              </div>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-sm text-gray-500 hover:text-gray-700 underline px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Skip setup
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-lg text-gray-600">{steps[currentStep].subtitle}</p>
          </div>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`
              flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all
              ${currentStep === 0
                ? 'text-gray-400 cursor-not-allowed opacity-50'
                : 'text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200'
              }
            `}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={completeOnboarding}
              className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
