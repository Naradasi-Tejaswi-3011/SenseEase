import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { getProductById } from '../data/products'
import ProductCard from '../components/ProductCard'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

const TestPage = () => {
  const { items, itemCount, total, addItem, removeItem, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { announceToScreenReader } = useAccessibility()
  const { trackInteraction } = useStressDetection()
  const [testResults, setTestResults] = useState([])

  const runTest = (testName, testFunction) => {
    try {
      const result = testFunction()
      setTestResults(prev => [...prev, { name: testName, status: 'pass', message: result }])
      announceToScreenReader(`Test ${testName} passed`)
    } catch (error) {
      setTestResults(prev => [...prev, { name: testName, status: 'fail', message: error.message }])
      announceToScreenReader(`Test ${testName} failed`)
    }
  }

  const testCartFunctionality = () => {
    const testProduct = getProductById(1)
    if (!testProduct) throw new Error('Test product not found')
    
    const initialCount = itemCount
    addItem(testProduct)
    
    if (itemCount <= initialCount) throw new Error('Cart count did not increase')
    return 'Cart add functionality working'
  }

  const testProductData = () => {
    const product = getProductById(1)
    if (!product) throw new Error('Product data not loading')
    if (!product.name || !product.price) throw new Error('Product missing required fields')
    return 'Product data structure correct'
  }

  const testImageLoading = () => {
    const product = getProductById(1)
    if (!product.image) throw new Error('Product image URL missing')
    if (!product.image.includes('placeholder')) throw new Error('Image URL not using placeholder service')
    return 'Image URLs updated to stable service'
  }

  const testNavigation = () => {
    if (typeof window === 'undefined') throw new Error('Window object not available')
    if (!window.location) throw new Error('Location object not available')
    return 'Navigation context available'
  }

  const runAllTests = () => {
    setTestResults([])
    runTest('Cart Functionality', testCartFunctionality)
    runTest('Product Data', testProductData)
    runTest('Image Loading', testImageLoading)
    runTest('Navigation', testNavigation)
  }

  const sampleProducts = [1, 2, 3, 4].map(id => getProductById(id)).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 py-8 page-transition">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 SenseEase Functionality Test</h1>
          <p className="text-gray-600">
            This page tests all the core functionality to ensure everything is working properly.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Automated Tests</h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runAllTests}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Run All Tests
            </button>
            <button
              onClick={() => setTestResults([])}
              className="btn-secondary px-6 py-3 rounded-lg"
            >
              Clear Results
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Test Results:</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    result.status === 'pass' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {result.status === 'pass' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🛒 Cart Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{itemCount}</div>
              <div className="text-sm text-blue-800">Items in Cart</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${total.toFixed(2)}</div>
              <div className="text-sm text-green-800">Total Value</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{items.length}</div>
              <div className="text-sm text-purple-800">Unique Products</div>
            </div>
          </div>
          
          {items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Items in Cart:</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{item.name} (x{item.quantity})</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={clearCart}
            className="btn-secondary px-4 py-2 rounded-lg text-sm"
            disabled={items.length === 0}
          >
            Clear Cart
          </button>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Authentication Status</h2>
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${
            isAuthenticated ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <Info className={`w-5 h-5 ${isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <div className="font-medium text-gray-900">
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
              <div className="text-sm text-gray-600">
                {isAuthenticated ? `Logged in as: ${user?.email || 'Unknown'}` : 'Please log in to test protected features'}
              </div>
            </div>
          </div>
        </div>

        {/* Sample Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🛍️ Sample Products (Test Cart)</h2>
          <p className="text-gray-600 mb-6">
            Click "Add to Cart" on any product below to test the cart functionality.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showDiscount={true}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage
