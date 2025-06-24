import React from 'react'

const SimplifiedNavigationPrompt = ({ onAccept, onDecline, stressLevel }) => {
  const getPromptMessage = () => {
    switch (stressLevel) {
      case 'high':
        return "We noticed you're navigating back and forth frequently. Would you like a simpler layout?"
      case 'medium':
        return "Having trouble finding what you need? Let's simplify the navigation for you."
      default:
        return "Would you like to try our simplified layout for easier navigation?"
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-slide-in-left">
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎛️</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Simplified Layout Available
            </h3>
            
            <p className="text-sm text-gray-700 mb-3">
              {getPromptMessage()}
            </p>
            
            <div className="text-xs text-gray-600 mb-3">
              Simplified layout includes:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Cleaner navigation menu</li>
                <li>Fewer options per page</li>
                <li>Larger buttons and links</li>
                <li>Better organization</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onAccept}
                className="flex-1 bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Simplify Layout
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

export default SimplifiedNavigationPrompt
