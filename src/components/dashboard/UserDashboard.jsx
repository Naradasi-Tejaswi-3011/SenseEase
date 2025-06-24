import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useAnalytics } from '../../hooks/useApi'
import apiService from '../../services/api'
import {
  ChartBarIcon,
  HeartIcon,
  ShoppingBagIcon,
  CogIcon,
  TrophyIcon,
  SparklesIcon,
  EyeIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const UserDashboard = () => {
  const { user } = useAuth()
  const { preferences } = useAccessibility()
  const analytics = useAnalytics()
  
  const [dashboardData, setDashboardData] = useState({
    orderStats: { total: 0, thisMonth: 0, totalSpent: 0 },
    accessibilityInsights: [],
    stressInsights: { stressPatterns: [], recentTrends: [] },
    adaptationUsage: [],
    comfortScore: 85
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load multiple data sources
      const [orderStats, accessibilityInsights, stressInsights] = await Promise.all([
        apiService.getOrderStats(),
        apiService.getAccessibilityInsights(),
        apiService.getStressInsights()
      ])

      setDashboardData({
        orderStats: orderStats.data,
        accessibilityInsights: accessibilityInsights.data,
        stressInsights: stressInsights.data,
        adaptationUsage: generateAdaptationUsage(),
        comfortScore: calculateComfortScore(stressInsights.data)
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAdaptationUsage = () => {
    const adaptations = []
    
    if (preferences.focusMode) {
      adaptations.push({ name: 'Focus Mode', usage: 85, icon: BoltIcon, color: 'blue' })
    }
    if (preferences.highContrast) {
      adaptations.push({ name: 'High Contrast', usage: 92, icon: EyeIcon, color: 'purple' })
    }
    if (preferences.dyslexiaSupport) {
      adaptations.push({ name: 'Dyslexia Font', usage: 78, icon: SparklesIcon, color: 'green' })
    }
    if (preferences.reducedMotion) {
      adaptations.push({ name: 'Reduced Motion', usage: 95, icon: HeartIcon, color: 'red' })
    }
    
    return adaptations
  }

  const calculateComfortScore = (stressData) => {
    if (!stressData.recentTrends || stressData.recentTrends.length === 0) {
      return 85 // Default score
    }
    
    const avgStress = stressData.recentTrends.reduce((sum, trend) => 
      sum + (trend.averageStressScore || 0), 0
    ) / stressData.recentTrends.length
    
    // Convert stress score to comfort score (inverse relationship)
    return Math.max(20, Math.min(100, 100 - (avgStress * 20)))
  }

  const getComfortScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComfortScoreMessage = (score) => {
    if (score >= 80) return "You're having a great shopping experience! 🌟"
    if (score >= 60) return "Your experience is good, with room for improvement 👍"
    return "Let's work on making your experience more comfortable 💙"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's how your personalized shopping experience is working for you
          </p>
        </div>

        {/* Comfort Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Comfort Score</h2>
              <p className="text-blue-100 mb-4">
                {getComfortScoreMessage(dashboardData.comfortScore)}
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">
                  {dashboardData.comfortScore}%
                </div>
                <div className="flex-1">
                  <div className="bg-white bg-opacity-20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${dashboardData.comfortScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-6xl opacity-20">
              🎯
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.orderStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.orderStats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dashboardData.orderStats.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Adaptations Used */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Adaptations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.adaptationUsage.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CogIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accessibility Usage */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Accessibility Tools
            </h3>
            
            {dashboardData.adaptationUsage.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.adaptationUsage.map((adaptation, index) => {
                  const IconComponent = adaptation.icon
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-${adaptation.color}-100 rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 text-${adaptation.color}-600`} />
                        </div>
                        <span className="font-medium text-gray-900">
                          {adaptation.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${adaptation.color}-500 h-2 rounded-full`}
                            style={{ width: `${adaptation.usage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">
                          {adaptation.usage}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No accessibility tools active yet. Try enabling some in your settings!
                </p>
              </div>
            )}
          </div>

          {/* Stress Insights */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stress Detection Insights
            </h3>
            
            {dashboardData.stressInsights.stressPatterns?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.stressInsights.stressPatterns.slice(0, 5).map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {pattern._id.type.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-600">
                        Detected {pattern.count} times
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pattern._id.severity === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : pattern._id.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pattern._id.severity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HeartIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Great! No stress patterns detected recently. You're shopping comfortably! 🌟
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trends */}
        {dashboardData.stressInsights.recentTrends?.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Shopping Comfort Trends (Last 7 Days)
            </h3>
            
            <div className="grid grid-cols-7 gap-2">
              {dashboardData.stressInsights.recentTrends.map((trend, index) => {
                const comfortScore = Math.max(20, Math.min(100, 100 - (trend.averageStressScore * 20)))
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">
                      {new Date(trend._id).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="h-20 bg-gray-100 rounded flex items-end justify-center">
                      <div 
                        className={`w-full rounded ${
                          comfortScore >= 80 ? 'bg-green-500' :
                          comfortScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${comfortScore}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Math.round(comfortScore)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            💡 Personalized Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.comfortScore < 80 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Try Focus Mode
                </h4>
                <p className="text-sm text-gray-600">
                  Based on your usage patterns, Focus Mode might help reduce distractions.
                </p>
              </div>
            )}
            
            {!preferences.dyslexiaSupport && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Dyslexia-Friendly Font
                </h4>
                <p className="text-sm text-gray-600">
                  Try our dyslexia-friendly font for easier reading.
                </p>
              </div>
            )}
            
            {dashboardData.orderStats.total === 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Start Shopping!
                </h4>
                <p className="text-sm text-gray-600">
                  Explore our accessible product catalog designed for your comfort.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
