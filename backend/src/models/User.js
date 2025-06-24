import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
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
  isDefault: {
    type: Boolean,
    default: false
  }
})

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit', 'paypal'],
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  expiryMonth: {
    type: Number,
    required: true
  },
  expiryYear: {
    type: Number,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  stripePaymentMethodId: String
})

const accessibilityPreferencesSchema = new mongoose.Schema({
  // Visual preferences
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
    default: 'medium'
  },
  highContrast: {
    type: Boolean,
    default: false
  },
  reducedMotion: {
    type: Boolean,
    default: false
  },
  colorBlindSupport: {
    type: String,
    enum: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
    default: 'none'
  },
  
  // Cognitive preferences
  simplifiedLayout: {
    type: Boolean,
    default: false
  },
  focusMode: {
    type: Boolean,
    default: false
  },
  readingGuide: {
    type: Boolean,
    default: false
  },
  
  // Motor preferences
  keyboardNavigation: {
    type: Boolean,
    default: false
  },
  voiceControl: {
    type: Boolean,
    default: false
  },
  
  // Sensory preferences
  reducedSounds: {
    type: Boolean,
    default: false
  },
  noFlashing: {
    type: Boolean,
    default: false
  },
  
  // Neurodiversity specific
  adhdSupport: {
    type: Boolean,
    default: false
  },
  autismSupport: {
    type: Boolean,
    default: false
  },
  dyslexiaSupport: {
    type: Boolean,
    default: false
  }
})

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Profile Information
  avatar: {
    type: String,
    default: ''
  },
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  
  // Accessibility & Preferences
  accessibilityPreferences: {
    type: accessibilityPreferencesSchema,
    default: () => ({})
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  
  // Shopping Data
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Analytics & Behavior
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  stressPatterns: [{
    type: {
      type: String,
      enum: ['rapid_navigation', 'long_pauses', 'failed_submissions', 'erratic_scrolling']
    },
    frequency: Number,
    lastDetected: Date,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }]
}, {
  timestamps: true
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }
  
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

// Method to generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
  
  this.emailVerificationToken = verificationToken
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  return verificationToken
}

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  
  this.resetPasswordToken = resetToken
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000 // 1 hour
  
  return resetToken
}

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password
    delete ret.emailVerificationToken
    delete ret.resetPasswordToken
    return ret
  }
})

export default mongoose.model('User', userSchema)
