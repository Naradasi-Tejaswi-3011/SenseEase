import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useShopping } from '../contexts/ShoppingContext'
import { ShoppingCart, User, Menu, X, Store, Settings } from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { cart } = useShopping()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (path) => {
    if ((path === '/cart' || path === '/profile') && !isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: path } } })
    } else {
      navigate(path)
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SenseEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Store className="w-5 h-5" />
              <span>Shop</span>
            </Link>
            <Link to="/accessibility" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Accessibility</span>
            </Link>
            <button
              onClick={() => handleNavClick('/cart')}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.firstName || 'Profile'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary">
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Store className="w-5 h-5" />
                <span>Shop</span>
              </Link>
              <Link
                to="/accessibility"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Accessibility</span>
              </Link>
              <button
                onClick={() => handleNavClick('/cart')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors text-left relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {cart.totalItems > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                    {cart.totalItems}
                  </span>
                )}
              </button>
              
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavClick('/profile')}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors text-left"
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.firstName || 'Profile'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary inline-block text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
