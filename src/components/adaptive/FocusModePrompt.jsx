import React from 'react'

const FocusModePrompt = ({ onAccept, onDecline, stressLevel }) => {
  const getPromptMessage = () => {
    switch (stressLevel) {
      case 'high':
        return "We noticed you might be feeling overwhelmed. Would you like to enable Focus Mode to simplify the interface?"
      case 'medium':
        return "It looks like you're having some difficulty. Focus Mode can help by reducing distractions."
      default:
        return "Would you like to try Focus Mode for a cleaner, more focused shopping experience?"
    }
  }

  const getPromptColor = () => {
    switch (stressLevel) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <div className={`rounded-lg border-2 p-4 shadow-lg ${getPromptColor()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎯</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Focus Mode Available
            </h3>
            
            <p className="text-sm text-gray-700 mb-3">
              {getPromptMessage()}
            </p>
            
            <div className="text-xs text-gray-600 mb-3">
              Focus Mode will:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Hide distracting elements</li>
                <li>Simplify navigation</li>
                <li>Reduce visual clutter</li>
                <li>Improve concentration</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onAccept}
                className="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Enable Focus Mode
              </button>
              
              <button
                onClick={onDecline}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md p-2 transition-colors"
                aria-label="Dismiss"
              >
                <span>×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FocusModePrompt
