import React from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { 
  Eye, 
  Type, 
  Palette, 
  Volume2, 
  Focus, 
  MousePointer, 
  Brain,
  RotateCcw,
  Settings,
  Check
} from 'lucide-react'

const AccessibilityPage = () => {
  const {
    theme,
    fontSize,
    fontFamily,
    highContrast,
    reducedMotion,
    focusMode,
    colorBlindSupport,
    readingGuide,
    keyboardNavigation,
    adhdSupport,
    autismSupport,
    dyslexiaSupport,
    motorImpairmentSupport,
    cognitiveSupport,
    stressDetection,
    stressLevel,
    calmingMode,
    reducedSounds,
    noFlashing,
    setTheme,
    setFontSize,
    setFontFamily,
    toggleHighContrast,
    toggleReducedMotion,
    toggleFocusMode,
    setColorBlindSupport,
    toggleReadingGuide,
    toggleKeyboardNavigation,
    setNeurodiversitySupport,
    toggleMotorImpairmentSupport,
    toggleCognitiveSupport,
    toggleStressDetection,
    setStressLevel,
    toggleCalmingMode,
    resetSettings
  } = useAccessibility()

  const handleNeurodiversityChange = (type, value) => {
    setNeurodiversitySupport({ [type]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Accessibility Settings</h1>
          <p className="text-gray-600">
            Customize your experience to match your needs. All settings are automatically saved.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Visual Preferences</h2>
            </div>

            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('default')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      theme === 'default' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                    <span className="text-sm font-medium">Default</span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('high-contrast')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      theme === 'high-contrast' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-full h-8 bg-black rounded mb-2"></div>
                    <span className="text-sm font-medium">High Contrast</span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('low-saturation')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      theme === 'low-saturation' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-full h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded mb-2"></div>
                    <span className="text-sm font-medium">Low Saturation</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['small', 'medium', 'large', 'extra-large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        fontSize === size 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Type className={`w-${size === 'small' ? '4' : size === 'medium' ? '5' : size === 'large' ? '6' : '7'} h-${size === 'small' ? '4' : size === 'medium' ? '5' : size === 'large' ? '6' : '7'} mx-auto mb-1`} />
                      <span className="text-xs capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font Family
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFontFamily('inter')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      fontFamily === 'inter' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-sans">Inter (Default)</span>
                  </button>
                  
                  <button
                    onClick={() => setFontFamily('dyslexic')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      fontFamily === 'dyslexic' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-dyslexic">OpenDyslexic</span>
                  </button>
                </div>
              </div>

              {/* Color Blind Support */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Blind Support
                </label>
                <select
                  value={colorBlindSupport}
                  onChange={(e) => setColorBlindSupport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Motor & Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MousePointer className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Motor & Navigation</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={keyboardNavigation}
                  onChange={toggleKeyboardNavigation}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Enhanced Keyboard Navigation</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={toggleReducedMotion}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Reduce Motion & Animations</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={focusMode}
                  onChange={toggleFocusMode}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Focus Mode (Simplified Layout)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={readingGuide}
                  onChange={toggleReadingGuide}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Reading Guide</span>
              </label>
            </div>
          </div>

          {/* Neurodiversity Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Neurodiversity Support</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={adhdSupport}
                  onChange={(e) => handleNeurodiversityChange('adhdSupport', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">ADHD Support</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autismSupport}
                  onChange={(e) => handleNeurodiversityChange('autismSupport', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Autism Spectrum Support</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dyslexiaSupport}
                  onChange={(e) => handleNeurodiversityChange('dyslexiaSupport', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Dyslexia Support</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={motorImpairmentSupport}
                  onChange={toggleMotorImpairmentSupport}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Motor Impairment Support</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cognitiveSupport}
                  onChange={toggleCognitiveSupport}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Cognitive Support</span>
              </label>
            </div>
          </div>

          {/* Sensory Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Volume2 className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Sensory Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reducedSounds}
                  onChange={(e) => handleNeurodiversityChange('reducedSounds', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Reduce Sounds</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={noFlashing}
                  onChange={(e) => handleNeurodiversityChange('noFlashing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">No Flashing Content</span>
              </label>
            </div>
          </div>

          {/* Stress Detection & Calming */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Stress Detection & Calming</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={stressDetection}
                  onChange={toggleStressDetection}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Enable Stress Detection</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={calmingMode}
                  onChange={toggleCalmingMode}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">Calming Mode</span>
              </label>

              {stressDetection && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Stress Level</span>
                    <span className="text-sm text-blue-600">{stressLevel}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stressLevel <= 3 ? 'bg-green-500' :
                        stressLevel <= 6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(stressLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Stress level is detected based on your interaction patterns
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Settings</h3>
              <p className="text-gray-600">Restore all accessibility settings to their default values.</p>
            </div>
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* Settings Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Settings className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">About These Settings</h3>
              <p className="text-blue-800 mb-3">
                These accessibility features are designed to make SenseEase more usable for people with various needs and preferences.
              </p>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Settings are automatically saved to your browser
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Changes apply immediately across the site
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Compatible with screen readers and assistive technology
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityPage
