import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { Search, ShoppingCart, User, Menu, X, LogIn } from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { itemCount } = useCart()
  const { preferences } = useUserProfile()
  const { trackInteraction } = useStressDetection()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      trackInteraction('search', { query: searchQuery })
      // Navigate to search results (to be implemented)
      console.log('Searching for:', searchQuery)
    }
  }

  const handleNavClick = (path, label) => {
    trackInteraction('navigation', { from: window.location.pathname, to: path, label })
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const mainNavItems = preferences.simplifiedNavigation
    ? [
        { path: '/', label: 'Home' },
        { path: '/cart', label: 'Cart' },
        ...(isAuthenticated ? [{ path: '/profile', label: 'Account' }] : [])
      ]
    : [
        { path: '/', label: 'Home' },
        { path: '/grocery', label: 'Grocery' },
        { path: '/electronics', label: 'Electronics' },
        { path: '/home', label: 'Home' },
        { path: '/clothing', label: 'Clothing' },
        { path: '/cart', label: 'Cart' },
        ...(isAuthenticated ? [{ path: '/profile', label: 'Account' }] : [])
      ]

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors"
            onClick={() => handleNavClick('/', 'Logo')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">SE</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-blue-600">SenseEase</div>
              <div className="text-xs text-gray-500 -mt-1">Accessible Shopping</div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search everything at SenseEase..."
                  className="w-full pl-6 pr-14 py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {mainNavItems.map(({ path, label }) => (
              <button
                key={path}
                onClick={() => handleNavClick(path, label)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            
            {/* Search Button - Mobile */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-walmart-blue transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNavClick('/cart', 'Cart')}
              className="relative p-3 text-gray-600 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account / Login */}
            {isAuthenticated ? (
              <button
                onClick={() => handleNavClick('/profile', 'Account')}
                className="hidden sm:flex p-3 text-gray-600 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
                aria-label="Account"
                title={`${user?.firstName} ${user?.lastName}`}
              >
                <User className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/auth', 'Login')}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors hover:bg-blue-50 rounded-lg font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-walmart-blue transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-walmart-blue transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-2">
            {mainNavItems.map(({ path, label }) => (
              <button
                key={path}
                onClick={() => handleNavClick(path, label)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-walmart-blue rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-walmart-blue text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </header>
  )
}

export default Header
