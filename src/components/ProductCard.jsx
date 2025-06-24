import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useToast } from '../contexts/ToastContext'

const ProductCard = ({ product, showDiscount = false, viewMode = 'grid' }) => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { trackInteraction } = useStressDetection()
  const { showSuccess, showError } = useToast()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    try {
      addItem(product)
      trackInteraction('add_to_cart', { productId: product.id, productName: product.name })

      // Show success toast
      showSuccess(`${product.name} added to cart!`, 2000)

      // Visual feedback on button
      const button = e.target.closest('button')
      const originalText = button.innerHTML
      button.innerHTML = '✓ Added!'
      button.style.backgroundColor = '#10B981'

      setTimeout(() => {
        button.innerHTML = originalText
        button.style.backgroundColor = ''
      }, 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      showError('Failed to add item to cart. Please try again.', 3000)
    }
  }

  const handleProductClick = () => {
    trackInteraction('product_view', { productId: product.id, productName: product.name })
    navigate(`/product/${product.id}`)
  }

  const discount = showDiscount && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group p-6"
        onClick={handleProductClick}
      >
        <div className="flex items-start space-x-6">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Product+Image'
                }}
              />
              {discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {showDiscount && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-green-600 font-medium mb-2">
                  {product.shippingInfo}
                </p>
              </div>

              {/* Add to Cart Button */}
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary px-6 py-3 rounded-lg flex items-center space-x-2 hover:scale-105 transition-transform"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg bg-gray-100 product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Product+Image'
          }}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-walmart-blue transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {showDiscount && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Shipping Info */}
        <p className="text-sm text-green-600 font-medium">
          {product.shippingInfo}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full btn-primary flex items-center justify-center space-x-2 mt-4"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  )
}

export default memo(ProductCard)
