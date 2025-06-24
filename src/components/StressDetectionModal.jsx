import React from 'react'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { X, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react'

const StressDetectionModal = () => {
  const { showSuggestionModal, suggestions, hideSuggestionModal, stressLevel } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()

  if (!showSuggestionModal || suggestions.length === 0) {
    return null
  }

  const handleSuggestionClick = (suggestion) => {
    suggestion.action()
    announceToScreenReader(`Applied suggestion: ${suggestion.title}`)
  }

  const handleDismiss = () => {
    hideSuggestionModal()
    announceToScreenReader('Suggestions dismissed')
  }

  const getStressLevelInfo = () => {
    switch (stressLevel) {
      case 'high':
        return {
          color: 'red',
          icon: AlertTriangle,
          title: 'High Stress Detected',
          description: 'We noticed you might be having difficulty. Here are some suggestions to help:'
        }
      case 'medium':
        return {
          color: 'yellow',
          icon: Lightbulb,
          title: 'Some Difficulty Detected',
          description: 'We have some suggestions that might make your shopping easier:'
        }
      default:
        return {
          color: 'blue',
          icon: Lightbulb,
          title: 'Helpful Suggestions',
          description: 'Here are some ways to improve your shopping experience:'
        }
    }
  }

  const stressInfo = getStressLevelInfo()
  const IconComponent = stressInfo.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${stressInfo.color}-500 to-${stressInfo.color}-600 text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${stressInfo.color}-400 rounded-full flex items-center justify-center`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{stressInfo.title}</h2>
                <p className="text-sm opacity-90">SenseEase Assistant</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Close suggestions"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">{stressInfo.description}</p>
          
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="btn-primary text-sm px-4 py-2 rounded-lg"
                    >
                      Apply This
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
              <div className="text-xs text-gray-400">
                These suggestions are based on your browsing patterns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StressDetectionModal
