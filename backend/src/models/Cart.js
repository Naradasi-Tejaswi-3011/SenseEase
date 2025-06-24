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
  addedAt: {
    type: Date,
    default: Date.now
  }
})

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0)
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  this.lastUpdated = new Date()
}

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString())
  
  if (existingItem) {
    existingItem.quantity += quantity
    existingItem.addedAt = new Date()
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      addedAt: new Date()
    })
  }
  
  this.calculateTotals()
}

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString())
  
  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(item => item.product.toString() !== productId.toString())
    } else {
      item.quantity = quantity
      item.addedAt = new Date()
    }
    this.calculateTotals()
    return true
  }
  return false
}

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString())
  this.calculateTotals()
}

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = []
  this.calculateTotals()
}

// Pre-save middleware to update totals
cartSchema.pre('save', function(next) {
  this.calculateTotals()
  next()
})

// Index for performance
cartSchema.index({ user: 1 })
cartSchema.index({ 'items.product': 1 })

export default mongoose.model('Cart', cartSchema)
