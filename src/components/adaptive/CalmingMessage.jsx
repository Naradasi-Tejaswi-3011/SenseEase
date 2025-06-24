import React from 'react'

const CalmingMessage = ({ onDismiss, stressLevel }) => {
  const messages = [
    "Take a deep breath. You're doing great! 🌟",
    "No rush - take your time to find what you need. 💙",
    "We're here to help make shopping easier for you. 🤗",
    "Remember, there's no pressure. Shop at your own pace. ✨",
    "You've got this! Take a moment if you need it. 🌈"
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-xl max-w-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💙</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Take a Moment
            </h3>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {randomMessage}
            </p>
            
            <div className="bg-white/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Tip:</strong> Try using our accessibility tools in the sidebar if you need help focusing or reading.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={onDismiss}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Thank you
              </button>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md p-1 transition-colors"
            aria-label="Dismiss"
          >
            <span>×</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalmingMessage
