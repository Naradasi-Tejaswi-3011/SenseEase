import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../contexts/ProductContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAnalytics } from '../hooks/useApi'
import ProductCard from '../components/ProductCard'
import Hero from '../components/Hero'
import CategoryGrid from '../components/CategoryGrid'
import NeuroOnboarding from '../components/onboarding/NeuroOnboarding'

const HomePage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { featuredProducts, loadFeaturedProducts, loading } = useProducts()
  const { isOnboarded, preferences } = useUserProfile()
  const { trackPageView, trackInteraction } = useStressDetection()
  const analytics = useAnalytics()

  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.isOnboarded) {
      setShowOnboarding(true)
    }
  }, [user])

  useEffect(() => {
    trackPageView('/')

    // Track page view
    analytics.trackEvent('page_view', {
      page: '/',
      timestamp: Date.now()
    })

    // Load featured products
    loadFeaturedProducts()
  }, [trackPageView, analytics, loadFeaturedProducts])

  const handleOnboardingComplete = (preferences) => {
    setShowOnboarding(false)
    console.log('Onboarding completed with preferences:', preferences)
  }

  // Temporary function to test stress detection
  const simulateStress = () => {
    // Simulate rapid navigation
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        trackInteraction('navigation', { path: `/test-${i}` })
      }, i * 100)
    }

    // Simulate repeated clicks
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          trackInteraction('click', { elementId: 'test-button' })
        }, i * 50)
      }
    }, 1000)

    // Simulate form errors
    setTimeout(() => {
      trackInteraction('form_error', { formId: 'test-form' })
    }, 2000)
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return <NeuroOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {!preferences.hideCarousels && <Hero />}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* Category Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find everything you need in our organized categories
            </p>
          </div>
          <CategoryGrid />
        </section>

        {/* Featured Products */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Hand-picked items just for you</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
          </div>
        </section>

        {/* More Products Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore More</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover products tailored to your needs
            </p>
          </div>
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate('/products')}
              className="btn-primary px-8 py-3 text-lg rounded-xl"
            >
              Browse All Products
            </button>

            {/* Temporary testing button - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div>
                <button
                  onClick={simulateStress}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  🧪 Test Stress Detection
                </button>
                <p className="text-xs text-gray-500 mt-1">Development only - simulates stress patterns</p>
              </div>
            )}
          </div>
        </section>

        {/* Focus Mode Message */}
        {preferences.focusMode && (
          <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Focus Mode Active</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Distracting elements are hidden to help you shop with less stress.
                You can turn this off anytime using the accessibility toolbar (Alt+A).
              </p>
            </div>
          </section>
        )}

        {/* Sign Up CTA for Non-Authenticated Users */}
        {!isAuthenticated && (
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🧠</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Experience Accessible Shopping</h2>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                Join SenseEase and discover a shopping experience designed for neurodiversity.
                Get personalized accessibility features, stress-free checkout, and a supportive interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-4">
                ✨ Try our demo: demo@senseease.com / demo123
              </p>
            </div>
          </section>
        )}

        {/* Accessibility Features Info */}
        {isAuthenticated && (preferences.hasADHD || preferences.hasAutism || preferences.hasDyslexia || preferences.hasSensoryIssues) && (
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-3">
                  Your Personalized Experience
                </h3>
                <p className="text-green-700 text-lg">
                  SenseEase has adapted the interface based on your preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferences.dyslexicFont && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📖</span>
                      <span className="font-medium text-green-900">Dyslexia-friendly font</span>
                    </div>
                  </div>
                )}
                {preferences.reducedMotion && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">⚡</span>
                      <span className="font-medium text-green-900">Reduced animations</span>
                    </div>
                  </div>
                )}
                {preferences.highContrast && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🔆</span>
                      <span className="font-medium text-green-900">High contrast colors</span>
                    </div>
                  </div>
                )}
                {preferences.hideCarousels && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🚫</span>
                      <span className="font-medium text-green-900">Hidden image carousels</span>
                    </div>
                  </div>
                )}
                {preferences.hidePopups && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🛡️</span>
                      <span className="font-medium text-green-900">Blocked pop-ups</span>
                    </div>
                  </div>
                )}
                {preferences.simplifiedNavigation && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🧭</span>
                      <span className="font-medium text-green-900">Simplified navigation</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default HomePage
