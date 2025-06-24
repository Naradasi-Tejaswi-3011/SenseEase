import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock, Truck, Shield } from 'lucide-react'

const CartPage = () => {
  const navigate = useNavigate()
  const {
    items,
    total,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart,
    getCartSummary
  } = useCart()
  const { isAuthenticated } = useAuth()
  const { trackInteraction } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()

  const cartSummary = getCartSummary()

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity)
    trackInteraction('cart_quantity_change', { productId, newQuantity })
    announceToScreenReader(`Quantity updated to ${newQuantity}`)
  }

  const handleRemoveItem = (productId, productName) => {
    removeItem(productId)
    trackInteraction('cart_remove_item', { productId })
    announceToScreenReader(`${productName} removed from cart`)
  }

  const handleClearCart = () => {
    clearCart()
    trackInteraction('cart_clear')
    announceToScreenReader('Cart cleared')
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
    trackInteraction('checkout_start', { itemCount, total })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to find great deals!
            </p>
            <Link
              to="/"
              className="btn-primary px-8 py-3 text-lg rounded-xl inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Brand: {item.brand} | Seller: {item.seller}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cartSummary.shipping === 0 ? 'FREE' : `$${cartSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${cartSummary.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {cartSummary.shipping > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Add ${(35 - cartSummary.subtotal).toFixed(2)} more for FREE shipping!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-4 text-lg font-semibold rounded-xl mb-4 flex items-center justify-center space-x-2"
              >
                <Lock className="w-5 h-5" />
                <span>Secure Checkout</span>
              </button>

              {/* Security Features */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free shipping on orders over $35</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                  <span>Easy returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
