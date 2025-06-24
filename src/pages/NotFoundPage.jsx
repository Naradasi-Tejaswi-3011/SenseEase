import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full btn-primary py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/search"
              className="flex-1 btn-secondary py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
            <Link
              to="/grocery"
              className="flex-1 btn-secondary py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop</span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Here are some popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/grocery', label: 'Grocery' },
              { to: '/electronics', label: 'Electronics' },
              { to: '/home', label: 'Home' },
              { to: '/clothing', label: 'Clothing' },
              { to: '/cart', label: 'Cart' }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center space-x-1 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
