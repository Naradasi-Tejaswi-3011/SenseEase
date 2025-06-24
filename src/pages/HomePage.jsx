import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { getFeaturedProducts, getDeals } from '../data/products'
import ProductCard from '../components/ProductCard'
import Hero from '../components/Hero'
import CategoryGrid from '../components/CategoryGrid'

const HomePage = () => {
  const navigate = useNavigate()
  const { isOnboarded, preferences } = useUserProfile()
  const { trackPageView } = useStressDetection()

  const featuredProducts = getFeaturedProducts()
  const deals = getDeals()

  useEffect(() => {
    trackPageView('/')
    
    // Redirect to onboarding if not completed
    if (!isOnboarded) {
      navigate('/onboarding')
    }
  }, [isOnboarded, navigate, trackPageView])

  if (!isOnboarded) {
    return null // Will redirect to onboarding
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
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>🔥</span>
              <span>Limited Time Offers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Great Deals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Save big on these amazing products
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} showDiscount />
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="btn-primary px-8 py-3 text-lg rounded-xl">
              View All Deals
            </button>
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

        {/* Accessibility Features Info */}
        {(preferences.hasADHD || preferences.hasAutism || preferences.hasDyslexia || preferences.hasSensoryIssues) && (
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
