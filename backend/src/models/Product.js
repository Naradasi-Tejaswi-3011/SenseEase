import mongoose from 'mongoose'

const nutritionInfoSchema = new mongoose.Schema({
  calories: Number,
  carbs: String,
  protein: String,
  fat: String,
  fiber: String,
  sugar: String,
  sodium: String,
  servingSize: String
}, { _id: false })

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { _id: false })

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  priceModifier: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  sku: String
}, { _id: false })

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Grocery', 'Electronics', 'Home', 'Clothing', 'Household Essentials', 'Sports & Outdoors']
  },
  subcategory: {
    type: String,
    required: [true, 'Product subcategory is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Brand & Seller
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  seller: {
    type: String,
    default: 'SenseEase',
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Inventory
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  inStock: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Product Details
  features: [{
    type: String,
    trim: true
  }],
  specifications: [specificationSchema],
  variants: [variantSchema],
  
  // Nutrition (for food products)
  nutritionInfo: nutritionInfoSchema,
  
  // Shipping & Delivery
  shippingInfo: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    estimatedDelivery: String
  },
  
  // Reviews & Ratings
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Accessibility Features
  accessibilityFeatures: {
    hasAltText: {
      type: Boolean,
      default: true
    },
    hasDetailedDescription: {
      type: Boolean,
      default: true
    },
    isScreenReaderFriendly: {
      type: Boolean,
      default: true
    },
    hasNutritionInfo: {
      type: Boolean,
      default: false
    }
  },
  
  // SEO & Marketing
  metaTitle: String,
  metaDescription: String,
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes for performance
productSchema.index({ category: 1, subcategory: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ rating: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ isActive: 1, inStock: 1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ tags: 1 })
productSchema.index({ name: 'text', description: 'text', tags: 'text' })

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary)
  return primary || this.images[0]
})

// Virtual for discount calculation
productSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.price) {
    return this.originalPrice - this.price
  }
  return 0
})

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Calculate discount percentage
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
    this.isOnSale = true
  } else {
    this.discountPercentage = 0
    this.isOnSale = false
  }
  
  // Update stock status
  this.inStock = this.stockQuantity > 0
  
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  
  next()
})

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0
    this.reviewCount = 0
    return
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10
  this.reviewCount = this.reviews.length
}

// Method to add review
productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData)
  this.calculateAverageRating()
  return this.save()
}

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true
})

export default mongoose.model('Product', productSchema)
