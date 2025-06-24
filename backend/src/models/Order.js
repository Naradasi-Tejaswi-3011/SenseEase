import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    description: String,
    image: String,
    brand: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  selectedVariants: [{
    name: String,
    value: String,
    priceModifier: Number
  }],
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
}, { _id: true })

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'United States'
  },
  phone: String
}, { _id: false })

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['credit', 'debit', 'paypal', 'stripe'],
    required: true
  },
  transactionId: String,
  paymentIntentId: String,
  last4: String,
  brand: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number
}, { _id: false })

const trackingInfoSchema = new mongoose.Schema({
  carrier: String,
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  updates: [{
    status: String,
    description: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: false })

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    required: true,
    min: [0, 'Shipping cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  
  // Applied discounts
  appliedCoupons: [{
    code: String,
    discountAmount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }],
  
  // Addresses
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: shippingAddressSchema,
  
  // Payment information
  paymentInfo: {
    type: paymentInfoSchema,
    required: true
  },
  
  // Order status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ],
    default: 'pending'
  },
  
  // Shipping information
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'pickup'],
    default: 'standard'
  },
  trackingInfo: trackingInfoSchema,
  
  // Important dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Customer communication
  customerNotes: String,
  internalNotes: String,
  
  // Accessibility preferences for this order
  accessibilityRequests: {
    largeText: Boolean,
    audioConfirmation: Boolean,
    simplifiedReceipt: Boolean,
    contactPreference: {
      type: String,
      enum: ['email', 'sms', 'phone', 'none'],
      default: 'email'
    }
  },
  
  // Return/refund information
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: String,
  returnRequestedAt: Date,
  returnApproved: Boolean,
  returnApprovedAt: Date,
  
  // Analytics
  source: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  deviceType: String,
  userAgent: String,
  
  // Processing information
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfillmentCenter: String
}, {
  timestamps: true
})

// Indexes
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ 'paymentInfo.status': 1 })
orderSchema.index({ orderDate: -1 })
orderSchema.index({ 'trackingInfo.trackingNumber': 1 })

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments()
    this.orderNumber = `SE${Date.now()}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  const now = new Date()
  
  this.status = newStatus
  
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now
      break
    case 'shipped':
      this.shippedAt = now
      break
    case 'delivered':
      this.deliveredAt = now
      break
    case 'cancelled':
      this.cancelledAt = now
      break
  }
  
  if (notes) {
    this.internalNotes = (this.internalNotes || '') + `\n[${now.toISOString()}] Status changed to ${newStatus}: ${notes}`
  }
  
  return this.save()
}

// Method to add tracking information
orderSchema.methods.addTrackingInfo = function(trackingData) {
  this.trackingInfo = {
    ...this.trackingInfo,
    ...trackingData
  }
  return this.save()
}

// Method to add tracking update
orderSchema.methods.addTrackingUpdate = function(status, description, location = '') {
  if (!this.trackingInfo) {
    this.trackingInfo = { updates: [] }
  }
  
  this.trackingInfo.updates.push({
    status,
    description,
    location,
    timestamp: new Date()
  })
  
  return this.save()
}

// Method to calculate order totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
  
  // Apply discounts
  let totalDiscount = 0
  this.appliedCoupons.forEach(coupon => {
    if (coupon.discountType === 'percentage') {
      totalDiscount += (this.subtotal * coupon.discountAmount / 100)
    } else {
      totalDiscount += coupon.discountAmount
    }
  })
  this.discount = Math.round(totalDiscount * 100) / 100
  
  // Calculate final total
  this.total = Math.round((this.subtotal + this.tax + this.shipping - this.discount) * 100) / 100
}

// Method to request return
orderSchema.methods.requestReturn = function(reason) {
  this.returnRequested = true
  this.returnReason = reason
  this.returnRequestedAt = new Date()
  return this.save()
}

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(userId = null, dateRange = null) {
  const matchStage = {}
  
  if (userId) {
    matchStage.user = new mongoose.Types.ObjectId(userId)
  }
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    }
  ])
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    statusBreakdown: []
  }
}

// Virtual for order summary
orderSchema.virtual('summary').get(function() {
  return {
    orderNumber: this.orderNumber,
    status: this.status,
    total: this.total,
    itemCount: this.items.length,
    orderDate: this.orderDate
  }
})

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
  virtuals: true
})

export default mongoose.model('Order', orderSchema)
