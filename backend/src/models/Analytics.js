import mongoose from 'mongoose'

const pageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeOnPage: {
    type: Number, // in seconds
    default: 0
  },
  exitPage: {
    type: Boolean,
    default: false
  },
  referrer: String,
  userAgent: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile'],
    default: 'desktop'
  }
}, { _id: false })

const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'click',
      'scroll',
      'search',
      'add_to_cart',
      'remove_from_cart',
      'checkout_start',
      'checkout_complete',
      'navigation',
      'form_submission',
      'error_encountered'
    ],
    required: true
  },
  element: String,
  page: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false })

const stressEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'rapid_navigation',
      'long_pauses',
      'failed_submissions',
      'erratic_scrolling',
      'repeated_clicks',
      'back_button_usage',
      'form_abandonment',
      'search_frustration'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  page: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  interventionShown: {
    type: Boolean,
    default: false
  },
  interventionType: String
}, { _id: false })

const accessibilityUsageSchema = new mongoose.Schema({
  feature: {
    type: String,
    enum: [
      'high_contrast',
      'large_text',
      'reduced_motion',
      'focus_mode',
      'reading_guide',
      'keyboard_navigation',
      'screen_reader',
      'voice_control'
    ],
    required: true
  },
  enabled: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionDuration: Number // how long the feature was used in seconds
}, { _id: false })

const analyticsSchema = new mongoose.Schema({
  // User identification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  
  // Session information
  sessionStart: {
    type: Date,
    default: Date.now
  },
  sessionEnd: Date,
  sessionDuration: Number, // in seconds
  
  // Page views and navigation
  pageViews: [pageViewSchema],
  totalPageViews: {
    type: Number,
    default: 0
  },
  
  // User interactions
  interactions: [interactionSchema],
  totalInteractions: {
    type: Number,
    default: 0
  },
  
  // Stress detection data
  stressEvents: [stressEventSchema],
  stressLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  stressScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Accessibility feature usage
  accessibilityUsage: [accessibilityUsageSchema],
  
  // Shopping behavior
  productsViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewCount: {
      type: Number,
      default: 1
    },
    timeSpent: Number, // seconds
    addedToCart: {
      type: Boolean,
      default: false
    },
    purchased: {
      type: Boolean,
      default: false
    }
  }],
  
  searchQueries: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resultsCount: Number,
    clickedResult: Boolean,
    refinements: [String]
  }],
  
  cartEvents: [{
    action: {
      type: String,
      enum: ['add', 'remove', 'update', 'clear', 'abandon']
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversion data
  checkoutStarted: {
    type: Boolean,
    default: false
  },
  checkoutCompleted: {
    type: Boolean,
    default: false
  },
  orderValue: Number,
  
  // Technical information
  deviceInfo: {
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile']
    },
    browser: String,
    os: String,
    screenResolution: String,
    viewport: String
  },
  
  // Performance metrics
  pageLoadTimes: [{
    page: String,
    loadTime: Number, // milliseconds
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Error tracking
  errors: [{
    type: String,
    message: String,
    page: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    stack: String
  }],
  
  // Engagement metrics
  bounceRate: Number,
  timeToFirstInteraction: Number, // seconds
  scrollDepth: Number, // percentage
  
  // Exit information
  exitPage: String,
  exitReason: {
    type: String,
    enum: ['natural', 'error', 'frustration', 'completion', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true
})

// Indexes for performance
analyticsSchema.index({ user: 1, sessionStart: -1 })
analyticsSchema.index({ sessionId: 1 })
analyticsSchema.index({ 'pageViews.page': 1 })
analyticsSchema.index({ 'stressEvents.type': 1, 'stressEvents.timestamp': -1 })
analyticsSchema.index({ 'accessibilityUsage.feature': 1 })
analyticsSchema.index({ createdAt: -1 })

// Pre-save middleware
analyticsSchema.pre('save', function(next) {
  // Update counters
  this.totalPageViews = this.pageViews.length
  this.totalInteractions = this.interactions.length
  
  // Calculate stress score based on events
  this.calculateStressScore()
  
  // Calculate session duration if session ended
  if (this.sessionEnd && this.sessionStart) {
    this.sessionDuration = Math.floor((this.sessionEnd - this.sessionStart) / 1000)
  }
  
  next()
})

// Method to calculate stress score
analyticsSchema.methods.calculateStressScore = function() {
  let score = 0
  const weights = {
    rapid_navigation: 15,
    long_pauses: 10,
    failed_submissions: 20,
    erratic_scrolling: 12,
    repeated_clicks: 18,
    back_button_usage: 8,
    form_abandonment: 25,
    search_frustration: 15
  }
  
  this.stressEvents.forEach(event => {
    const baseScore = weights[event.type] || 10
    const severityMultiplier = event.severity === 'high' ? 1.5 : event.severity === 'medium' ? 1.2 : 1
    score += baseScore * severityMultiplier
  })
  
  // Cap at 100
  this.stressScore = Math.min(score, 100)
  
  // Determine stress level
  if (this.stressScore >= 70) {
    this.stressLevel = 'high'
  } else if (this.stressScore >= 40) {
    this.stressLevel = 'medium'
  } else {
    this.stressLevel = 'low'
  }
}

// Method to add page view
analyticsSchema.methods.addPageView = function(pageData) {
  this.pageViews.push(pageData)
  return this.save()
}

// Method to add interaction
analyticsSchema.methods.addInteraction = function(interactionData) {
  this.interactions.push(interactionData)
  return this.save()
}

// Method to add stress event
analyticsSchema.methods.addStressEvent = function(eventData) {
  this.stressEvents.push(eventData)
  return this.save()
}

// Method to end session
analyticsSchema.methods.endSession = function(exitPage, exitReason = 'natural') {
  this.sessionEnd = new Date()
  this.exitPage = exitPage
  this.exitReason = exitReason
  return this.save()
}

// Static method to get user analytics summary
analyticsSchema.statics.getUserSummary = async function(userId, dateRange = null) {
  const matchStage = { user: new mongoose.Types.ObjectId(userId) }
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalPageViews: { $sum: '$totalPageViews' },
        totalInteractions: { $sum: '$totalInteractions' },
        averageStressScore: { $avg: '$stressScore' },
        totalStressEvents: { $sum: { $size: '$stressEvents' } },
        averageSessionDuration: { $avg: '$sessionDuration' },
        mostUsedAccessibilityFeatures: {
          $push: '$accessibilityUsage.feature'
        }
      }
    }
  ])
  
  return summary[0] || {}
}

// Static method to get platform analytics
analyticsSchema.statics.getPlatformStats = async function(dateRange = null) {
  const matchStage = {}
  
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
        totalUsers: { $addToSet: '$user' },
        totalSessions: { $sum: 1 },
        averageStressScore: { $avg: '$stressScore' },
        highStressSessions: {
          $sum: { $cond: [{ $gte: ['$stressScore', 70] }, 1, 0] }
        },
        accessibilityFeatureUsage: {
          $push: '$accessibilityUsage'
        },
        deviceBreakdown: {
          $push: '$deviceInfo.deviceType'
        }
      }
    },
    {
      $project: {
        totalUsers: { $size: '$totalUsers' },
        totalSessions: 1,
        averageStressScore: 1,
        highStressSessions: 1,
        stressPercentage: {
          $multiply: [
            { $divide: ['$highStressSessions', '$totalSessions'] },
            100
          ]
        },
        accessibilityFeatureUsage: 1,
        deviceBreakdown: 1
      }
    }
  ])
  
  return stats[0] || {}
}

export default mongoose.model('Analytics', analyticsSchema)
