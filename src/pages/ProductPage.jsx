import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { getProductById } from '../data/products'
import { useAnalytics } from '../hooks/useApi'
import stressDetection from '../utils/stressDetection'
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Check,
  AlertCircle
} from 'lucide-react'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, getItemQuantity, updateQuantity } = useCart()
  const { loadProduct, currentProduct, loading, recommendations, loadRecommendations } = useProducts()
  const { trackInteraction } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()
  const analytics = useAnalytics()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showAddedToCart, setShowAddedToCart] = useState(false)

  useEffect(() => {
    if (id) {
      loadProduct(id).catch(() => {
        navigate('/404')
      })
    }
  }, [id, loadProduct, navigate])

  useEffect(() => {
    if (currentProduct) {
      // Load recommendations
      loadRecommendations(currentProduct.id)

      // Track product view
      trackInteraction('product_page_view', {
        productId: currentProduct.id,
        productName: currentProduct.name
      })

      // Report to stress detection system
      stressDetection.reportSearchFrustration('', 1) // Found product
    }
  }, [currentProduct, loadRecommendations, trackInteraction])

  if (loading || !currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  const product = currentProduct

  const handleAddToCart = async () => {
    try {
      await addItem(product, quantity)
      setShowAddedToCart(true)
      setTimeout(() => setShowAddedToCart(false), 3000)

      trackInteraction('add_to_cart', {
        productId: product.id,
        productName: product.name,
        quantity
      })

      announceToScreenReader(`Added ${quantity} ${product.name} to cart`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      announceToScreenReader('Failed to add item to cart. Please try again.')
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    trackInteraction('wishlist_toggle', {
      productId: product.id,
      added: !isWishlisted
    })
    announceToScreenReader(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      announceToScreenReader('Product link copied to clipboard')
    }
    trackInteraction('product_share', { productId: product.id })
  }

  const currentCartQuantity = getItemQuantity(product.id)
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Product images from API
  const productImages = product.images?.length > 0
    ? product.images.map(img => img.url)
    : [product.primaryImage?.url || product.image || '/placeholder-product.jpg']

  // Product reviews from API
  const reviews = product.reviews || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to={`/category/${product.category.toLowerCase()}`} className="text-blue-600 hover:text-blue-700">
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{product.name}</span>
          </div>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Success Message */}
        {showAddedToCart && (
          <div className="fixed top-24 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Added to cart!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Brand: <span className="font-medium">{product.brand}</span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.inStock ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {currentCartQuantity > 0 && (
                      <span className="text-sm text-gray-600">
                        ({currentCartQuantity} in cart)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary py-3 text-lg font-semibold rounded-xl flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`p-3 border-2 rounded-xl transition-colors ${
                      isWishlisted
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 border-2 border-gray-300 hover:border-gray-400 text-gray-600 rounded-xl transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{product.shippingInfo}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Free returns within 30 days</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">1-year warranty included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
                {product.features && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Benefits:</h3>
                    <ul className="space-y-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Brand:</dt>
                      <dd className="font-medium">{product.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Subcategory:</dt>
                      <dd className="font-medium">{product.subcategory}</dd>
                    </div>
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dimensions:</dt>
                        <dd className="font-medium">{product.dimensions}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                {product.nutritionInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h3>
                    <dl className="space-y-3">
                      {Object.entries(product.nutritionInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-gray-600 capitalize">{key}:</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <button className="btn-secondary px-4 py-2 rounded-lg">
                    Write a Review
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {product.rating}
                        </div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on {product.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{review.author}</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Free Standard Shipping</p>
                        <p className="text-sm text-gray-600">On orders over $35. Delivery in 5-7 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Express Shipping</p>
                        <p className="text-sm text-gray-600">$9.99. Delivery in 2-3 business days.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns & Exchanges</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <RotateCcw className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">30-Day Returns</p>
                        <p className="text-sm text-gray-600">Free returns on most items within 30 days.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Warranty</p>
                        <p className="text-sm text-gray-600">1-year manufacturer warranty included.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
