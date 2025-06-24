import React from 'react'
import { useUserProfile } from '../contexts/UserProfileContext'
import { ShoppingBag, Heart, Truck } from 'lucide-react'

const Hero = () => {
  const { preferences } = useUserProfile()

  // Don't render if user prefers to hide carousels
  if (preferences.hideCarousels) {
    return null
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm">
                <Heart className="w-4 h-4" />
                <span>Designed for neurodiversity</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Welcome to
                <span className="block text-yellow-300">SenseEase</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Shopping made comfortable, accessible, and stress-free for everyone.
                Specially designed for ADHD, autism, dyslexia, and sensory sensitivities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-800 transition-all duration-300 flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Learn More</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Free Pickup</div>
                  <div className="text-sm text-blue-200">Same day available</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Adaptive UI</div>
                  <div className="text-sm text-blue-200">Personalized experience</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Focus Mode</div>
                  <div className="text-sm text-blue-200">Distraction-free shopping</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop&crop=center"
                alt="Happy family shopping"
                className="rounded-2xl shadow-2xl"
                loading="eager"
              />
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white text-gray-900 p-4 rounded-xl shadow-lg">
                <div className="text-sm font-semibold">Accessibility First</div>
                <div className="text-xs text-gray-600">WCAG 2.1 AA Compliant</div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-blue-900 p-4 rounded-xl shadow-lg">
                <div className="text-sm font-semibold">Save Money</div>
                <div className="text-xs">Live Better</div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl transform rotate-6 scale-105 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
