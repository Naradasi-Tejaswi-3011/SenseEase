import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  selectedVariants: [{
    name: String,
    value: String,
    priceModifier: {
      type: Number,
      default: 0
    }
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  
  // Calculated fields
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Item count cannot be negative']
  },
  
  // Applied coupons/discounts
  appliedCoupons: [{
    code: String,
    discountAmount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }],
  
  // Shipping information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Cart status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  
  // Timestamps for cart abandonment tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
})

// Indexes
cartSchema.index({ user: 1 })
cartSchema.index({ status: 1 })
cartSchema.index({ lastActivity: -1 })
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.calculateTotals()
  this.lastActivity = new Date()
  next()
})

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal and item count
  this.subtotal = 0
  this.itemCount = 0
  
  this.items.forEach(item => {
    const itemPrice = item.price
    const variantPrice = item.selectedVariants.reduce((sum, variant) => sum + variant.priceModifier, 0)
    const totalItemPrice = (itemPrice + variantPrice) * item.quantity
    
    this.subtotal += totalItemPrice
    this.itemCount += item.quantity
  })
  
  // Calculate tax (8.5% default)
  const taxRate = 0.085
  this.tax = Math.round(this.subtotal * taxRate * 100) / 100
  
  // Calculate shipping (free shipping over $35)
  this.shipping = this.subtotal >= 35 ? 0 : 5.99
  
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
  
  // Ensure total is not negative
  if (this.total < 0) {
    this.total = 0
  }
}

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, price, selectedVariants = []) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
  )
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedVariants
    })
  }
  
  return this.save()
}

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId)
  if (item) {
    if (quantity <= 0) {
      this.items.pull(itemId)
    } else {
      item.quantity = quantity
    }
  }
  return this.save()
}

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId)
  return this.save()
}

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = []
  this.appliedCoupons = []
  return this.save()
}

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discountAmount, discountType) {
  // Check if coupon already applied
  const existingCoupon = this.appliedCoupons.find(coupon => coupon.code === couponCode)
  if (existingCoupon) {
    throw new Error('Coupon already applied')
  }
  
  this.appliedCoupons.push({
    code: couponCode,
    discountAmount,
    discountType
  })
  
  return this.save()
}

// Method to remove coupon
cartSchema.methods.removeCoupon = function(couponCode) {
  this.appliedCoupons = this.appliedCoupons.filter(coupon => coupon.code !== couponCode)
  return this.save()
}

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product')
  
  if (!cart) {
    cart = new this({ user: userId })
    await cart.save()
  }
  
  return cart
}

// Virtual for cart summary
cartSchema.virtual('summary').get(function() {
  return {
    itemCount: this.itemCount,
    subtotal: this.subtotal,
    tax: this.tax,
    shipping: this.shipping,
    discount: this.discount,
    total: this.total
  }
})

// Ensure virtual fields are serialized
cartSchema.set('toJSON', {
  virtuals: true
})

export default mongoose.model('Cart', cartSchema)
