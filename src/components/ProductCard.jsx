import React from 'react'
import { Star, ShoppingCart } from 'lucide-react'
import { useStressDetection } from '../contexts/StressDetectionContext'

const ProductCard = ({ product, showDiscount = false }) => {
  const { trackInteraction } = useStressDetection()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    trackInteraction('add_to_cart', { productId: product.id, productName: product.name })
    // Add to cart logic would go here
    console.log('Added to cart:', product.name)
  }

  const handleProductClick = () => {
    trackInteraction('product_view', { productId: product.id, productName: product.name })
    // Navigate to product page
    console.log('View product:', product.name)
  }

  const discount = showDiscount && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

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
          className="w-full h-48 object-cover rounded-lg bg-gray-100"
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

export default ProductCard
