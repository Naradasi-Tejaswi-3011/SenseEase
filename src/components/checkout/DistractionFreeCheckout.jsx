import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useAnalytics } from '../../hooks/useApi'
import apiService from '../../services/api'
import { CheckCircleIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline'

const DistractionFreeCheckout = () => {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const { preferences } = useAccessibility()
  const analytics = useAnalytics()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [formData, setFormData] = useState({
    // Shipping Information
    shippingAddress: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    // Billing Information
    billingAddress: {
      sameAsShipping: true,
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    // Payment Information
    paymentMethod: 'credit',
    // Accessibility Requests
    accessibilityRequests: {
      largeText: preferences.fontSize === 'large',
      highContrast: preferences.highContrast,
      noFlashing: preferences.noFlashing,
      extendedTime: preferences.extendedTimeouts,
      specialInstructions: ''
    },
    // Customer Notes
    customerNotes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Track checkout start
    analytics.trackEvent('checkout_started', {
      cartValue: cart?.total || 0,
      itemCount: cart?.itemCount || 0,
      distractionFree: preferences.distractionFreeCheckout
    })

    // Prevent accidental navigation
    const handleBeforeUnload = (e) => {
      if (!orderComplete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [cart, preferences, analytics, orderComplete])

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: null
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      // Validate shipping address
      const required = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode']
      required.forEach(field => {
        if (!formData.shippingAddress[field]?.trim()) {
          newErrors[`shippingAddress.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        }
      })
    }

    if (step === 2) {
      // Validate billing address if different from shipping
      if (!formData.billingAddress.sameAsShipping) {
        const required = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode']
        required.forEach(field => {
          if (!formData.billingAddress[field]?.trim()) {
            newErrors[`billingAddress.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
          }
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      
      analytics.trackEvent('checkout_step_completed', {
        step: currentStep,
        stepName: getStepName(currentStep)
      })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getStepName = (step) => {
    const names = {
      1: 'shipping',
      2: 'billing',
      3: 'payment',
      4: 'review'
    }
    return names[step] || 'unknown'
  }

  const completeOrder = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    
    try {
      const orderData = {
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress.sameAsShipping 
          ? formData.shippingAddress 
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        customerNotes: formData.customerNotes,
        accessibilityRequests: formData.accessibilityRequests
      }

      const response = await apiService.createOrder(orderData)
      
      if (response.success) {
        setOrderNumber(response.data.orderNumber)
        setOrderComplete(true)
        await clearCart()
        
        analytics.trackEvent('order_completed', {
          orderNumber: response.data.orderNumber,
          orderValue: response.data.total,
          paymentMethod: formData.paymentMethod,
          distractionFree: preferences.distractionFreeCheckout
        })
      }
    } catch (error) {
      console.error('Order failed:', error)
      setErrors({ general: error.message || 'Order failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Complete! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your order number is:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <span className="text-lg font-mono font-bold text-blue-600">
              {orderNumber}
            </span>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Order Details
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Shipping Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData.shippingAddress.firstName}
            onChange={(e) => updateFormData('shippingAddress', 'firstName', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors['shippingAddress.firstName'] ? 'border-red-500' : 'border-gray-300'}`}
            aria-describedby={errors['shippingAddress.firstName'] ? 'firstName-error' : undefined}
          />
          {errors['shippingAddress.firstName'] && (
            <p id="firstName-error" className="text-red-500 text-sm mt-1">
              {errors['shippingAddress.firstName']}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.shippingAddress.lastName}
            onChange={(e) => updateFormData('shippingAddress', 'lastName', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors['shippingAddress.lastName'] ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors['shippingAddress.lastName'] && (
            <p className="text-red-500 text-sm mt-1">
              {errors['shippingAddress.lastName']}
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <input
          type="text"
          value={formData.shippingAddress.street}
          onChange={(e) => updateFormData('shippingAddress', 'street', e.target.value)}
          className={`w-full p-3 border rounded-lg ${errors['shippingAddress.street'] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="123 Main Street"
        />
        {errors['shippingAddress.street'] && (
          <p className="text-red-500 text-sm mt-1">
            {errors['shippingAddress.street']}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={formData.shippingAddress.city}
            onChange={(e) => updateFormData('shippingAddress', 'city', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors['shippingAddress.city'] ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors['shippingAddress.city'] && (
            <p className="text-red-500 text-sm mt-1">
              {errors['shippingAddress.city']}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            value={formData.shippingAddress.state}
            onChange={(e) => updateFormData('shippingAddress', 'state', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors['shippingAddress.state'] ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select State</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            {/* Add more states as needed */}
          </select>
          {errors['shippingAddress.state'] && (
            <p className="text-red-500 text-sm mt-1">
              {errors['shippingAddress.state']}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            value={formData.shippingAddress.zipCode}
            onChange={(e) => updateFormData('shippingAddress', 'zipCode', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors['shippingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="12345"
          />
          {errors['shippingAddress.zipCode'] && (
            <p className="text-red-500 text-sm mt-1">
              {errors['shippingAddress.zipCode']}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const renderBillingStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Billing Information
      </h2>
      
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.billingAddress.sameAsShipping}
            onChange={(e) => updateFormData('billingAddress', 'sameAsShipping', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span>Billing address is the same as shipping address</span>
        </label>
      </div>
      
      {!formData.billingAddress.sameAsShipping && (
        <div className="space-y-4">
          {/* Similar form fields as shipping but for billing */}
          <p className="text-gray-600">
            Please enter your billing address details.
          </p>
          {/* Add billing form fields here */}
        </div>
      )}
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Payment Method
      </h2>
      
      <div className="space-y-4">
        <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
          <input
            type="radio"
            name="paymentMethod"
            value="credit"
            checked={formData.paymentMethod === 'credit'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">Credit/Debit Card</div>
            <div className="text-sm text-gray-600">Secure payment processing</div>
          </div>
        </label>
        
        <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={formData.paymentMethod === 'paypal'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <div className="font-medium">PayPal</div>
            <div className="text-sm text-gray-600">Pay with your PayPal account</div>
          </div>
        </label>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Your payment information is secure and encrypted
          </span>
        </div>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Review Your Order
      </h2>
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
        
        {cart?.items?.map(item => (
          <div key={item.id} className="flex justify-between items-center py-2">
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>${cart?.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
      
      {/* Shipping Address */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
        <div className="text-gray-700">
          <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
          <p>{formData.shippingAddress.street}</p>
          <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
        </div>
      </div>
      
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderShippingStep()
      case 2: return renderBillingStep()
      case 3: return renderPaymentStep()
      case 4: return renderReviewStep()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean, distraction-free header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Secure Checkout
            </h1>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Shipping</span>
            <span>Billing</span>
            <span>Payment</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStepContent()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep === 4 ? (
              <button
                onClick={completeOrder}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Order</span>
                    <TruckIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DistractionFreeCheckout
