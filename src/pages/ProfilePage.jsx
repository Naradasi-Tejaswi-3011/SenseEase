import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import {
  User,
  Settings,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Eye,
  Type,
  Palette,
  Volume2,
  Edit,
  Save,
  X
} from 'lucide-react'

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth()
  const {
    preferences,
    updatePreferences,
    updatePreference,
    shoppingHistory,
    resetProfile
  } = useUserProfile()
  const {
    toggleHighContrast,
    toggleLowSaturation,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleFocusMode,
    setTextSize,
    announceToScreenReader
  } = useAccessibility()

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      updateUser(editData)
      announceToScreenReader('Profile updated successfully')
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogout = () => {
    logout()
    announceToScreenReader('Logged out successfully')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, preferences, and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 hover:text-red-700 font-medium py-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      <span>{isEditing ? 'Save' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={editData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-3">{user?.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={editData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-3">{user?.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-3">{user?.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-3">{user?.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {shoppingHistory.completedCheckouts}
                        </div>
                        <div className="text-sm text-blue-800">Orders Completed</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {shoppingHistory.focusModeUsage}
                        </div>
                        <div className="text-sm text-green-800">Focus Mode Uses</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {shoppingHistory.adaptationsUsed.length}
                        </div>
                        <div className="text-sm text-purple-800">Adaptations Used</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Settings</h2>

                  {/* Neurodiversity Preferences */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Neurodiversity Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'hasADHD', label: 'I have ADHD', icon: '🧠' },
                        { key: 'hasAutism', label: 'I am autistic', icon: '🌟' },
                        { key: 'hasDyslexia', label: 'I have dyslexia', icon: '📖' },
                        { key: 'hasSensoryIssues', label: 'I have sensory sensitivities', icon: '🎨' },
                      ].map(({ key, label, icon }) => (
                        <label
                          key={key}
                          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <span className="text-2xl">{icon}</span>
                          <input
                            type="checkbox"
                            checked={preferences[key]}
                            onChange={(e) => updatePreference(key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-900">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Visual Preferences */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Type className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Text Size</span>
                        </div>
                        <select
                          value={preferences.textSize}
                          onChange={(e) => setTextSize(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>

                      {[
                        {
                          key: 'dyslexicFont',
                          label: 'Dyslexia-friendly font',
                          icon: Type,
                          toggle: toggleDyslexicFont
                        },
                        {
                          key: 'highContrast',
                          label: 'High contrast mode',
                          icon: Eye,
                          toggle: toggleHighContrast
                        },
                        {
                          key: 'lowSaturation',
                          label: 'Low saturation colors',
                          icon: Palette,
                          toggle: toggleLowSaturation
                        },
                        {
                          key: 'reducedMotion',
                          label: 'Reduce motion and animations',
                          icon: Volume2,
                          toggle: toggleReducedMotion
                        },
                      ].map(({ key, label, icon: IconComponent, toggle }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{label}</span>
                          </div>
                          <button
                            onClick={toggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interface Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'hideCarousels', label: 'Hide image carousels and slideshows' },
                        { key: 'hidePopups', label: 'Block promotional pop-ups' },
                        { key: 'hideTimers', label: 'Hide countdown timers' },
                        { key: 'simplifiedNavigation', label: 'Use simplified navigation' },
                        { key: 'extendedTimeouts', label: 'Extended form timeouts' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <span className="font-medium text-gray-900">{label}</span>
                          <button
                            onClick={() => updatePreference(key, !preferences[key])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <button
                      onClick={() => {
                        resetProfile()
                        announceToScreenReader('All preferences reset to default')
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Reset All Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">
                      When you place your first order, it will appear here.
                    </p>
                    <button className="btn-primary px-6 py-3 rounded-lg">
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* Other tabs placeholder */}
              {['wishlist', 'addresses', 'payment', 'notifications', 'security'].includes(activeTab) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-600">
                      This feature is currently under development.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
