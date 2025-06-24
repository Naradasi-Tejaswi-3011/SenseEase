import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import {
  CreditCard,
  MapPin,
  Truck,
  Shield,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getCartSummary, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { preferences, incrementCheckouts } = useUserProfile()
  const { trackInteraction } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()

  const [currentStep, setCurrentStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping Address
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',

    // Payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',

    // Options
    shippingMethod: 'standard',
    saveAddress: false,
    savePayment: false,
    giftMessage: '',
    specialInstructions: ''
  })
  const [errors, setErrors] = useState({})

  const cartSummary = getCartSummary()

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } })
      return
    }

    if (items.length === 0) {
      navigate('/cart')
      return
    }
  }, [isAuthenticated, items.length, navigate])

  // Track checkout start
  useEffect(() => {
    trackInteraction('checkout_page_view', {
      itemCount: items.length,
      total: cartSummary.total
    })
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      // Shipping validation
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone) newErrors.phone = 'Phone is required'
      if (!formData.address) newErrors.address = 'Address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.state) newErrors.state = 'State is required'
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    }

    if (step === 2) {
      // Payment validation
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
      if (!formData.cvv) newErrors.cvv = 'CVV is required'
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      trackInteraction('checkout_step_complete', { step: currentStep })
      announceToScreenReader(`Moved to step ${currentStep + 1}`)
    } else {
      announceToScreenReader('Please fix the form errors before continuing')
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    announceToScreenReader(`Moved to step ${currentStep - 1}`)
  }

  const placeOrder = async () => {
    if (!validateStep(2)) {
      announceToScreenReader('Please fix the form errors before placing your order')
      return
    }

    setProcessing(true)
    trackInteraction('order_place_attempt', {
      itemCount: items.length,
      total: cartSummary.total
    })

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Clear cart and update user stats
      clearCart()
      incrementCheckouts()

      setOrderPlaced(true)
      setProcessing(false)

      trackInteraction('order_place_success', {
        itemCount: items.length,
        total: cartSummary.total
      })

      announceToScreenReader('Order placed successfully!')
    } catch (error) {
      setProcessing(false)
      announceToScreenReader('Error placing order. Please try again.')
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-bold text-gray-900">#SE{Date.now()}</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="w-full btn-primary py-3 rounded-lg"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full btn-secondary py-3 rounded-lg"
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Shipping', description: 'Where should we send your order?' },
    { number: 2, title: 'Payment', description: 'How would you like to pay?' },
    { number: 3, title: 'Review', description: 'Review your order before placing' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-4
                    ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>

                  {/* No Time Pressure Message */}
                  {preferences.extendedTimeouts && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <p className="text-blue-800 font-medium">Take your time</p>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        This form won't timeout. Fill it out at your own pace.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select State</option>
                        <option value="NY">New York</option>
                        <option value="CA">California</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10001"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                          maxLength="4"
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.cardName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="standard"
                            checked={formData.shippingMethod === 'standard'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">Standard Shipping</span>
                              <span className="text-green-600 font-medium">FREE</span>
                            </div>
                            <p className="text-sm text-gray-600">5-7 business days</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="express"
                            checked={formData.shippingMethod === 'express'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">Express Shipping</span>
                              <span className="font-medium">$9.99</span>
                            </div>
                            <p className="text-sm text-gray-600">2-3 business days</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="overnight"
                            checked={formData.shippingMethod === 'overnight'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">Overnight Shipping</span>
                              <span className="font-medium">$19.99</span>
                            </div>
                            <p className="text-sm text-gray-600">Next business day</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="savePayment"
                          checked={formData.savePayment}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Save payment method for future orders
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>

                  <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                      <div className="text-sm text-gray-600">
                        <p>{formData.firstName} {formData.lastName}</p>
                        <p>{formData.address}</p>
                        {formData.apartment && <p>{formData.apartment}</p>}
                        <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                        <p>{formData.phone}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                      <div className="text-sm text-gray-600">
                        <p>**** **** **** {formData.cardNumber.slice(-4)}</p>
                        <p>{formData.cardName}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special delivery instructions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-colors
                    ${currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }
                  `}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="btn-primary px-8 py-3 rounded-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={placeOrder}
                    disabled={processing}
                    className="btn-primary px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {cartSummary.shipping === 0 ? 'FREE' : `$${cartSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
