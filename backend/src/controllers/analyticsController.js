import { Analytics, User } from '../models/index.js'
import { logger } from '../utils/logger.js'

// @desc    Track analytics event
// @route   POST /api/analytics/track
// @access  Public (with optional auth)
export const trackEvent = async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      eventData,
      page,
      timestamp = new Date()
    } = req.body

    if (!sessionId || !eventType) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and event type are required'
      })
    }

    // Find or create analytics session
    let analytics = await Analytics.findOne({ sessionId })
    
    if (!analytics) {
      analytics = new Analytics({
        user: req.user?._id,
        sessionId,
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          deviceType: getDeviceType(req.headers['user-agent'])
        }
      })
    }

    // Track different types of events
    switch (eventType) {
      case 'page_view':
        await analytics.addPageView({
          page: eventData.page,
          timestamp,
          referrer: eventData.referrer,
          userAgent: req.headers['user-agent']
        })
        break

      case 'interaction':
        await analytics.addInteraction({
          type: eventData.type,
          element: eventData.element,
          page,
          timestamp,
          metadata: eventData.metadata
        })
        break

      case 'stress_event':
        await analytics.addStressEvent({
          type: eventData.type,
          severity: eventData.severity || 'medium',
          page,
          timestamp,
          context: eventData.context
        })
        break

      case 'accessibility_usage':
        analytics.accessibilityUsage.push({
          feature: eventData.feature,
          enabled: eventData.enabled,
          timestamp,
          sessionDuration: eventData.sessionDuration
        })
        await analytics.save()
        break

      case 'search':
        analytics.searchQueries.push({
          query: eventData.query,
          timestamp,
          resultsCount: eventData.resultsCount,
          clickedResult: eventData.clickedResult
        })
        await analytics.save()
        break

      case 'cart_event':
        analytics.cartEvents.push({
          action: eventData.action,
          productId: eventData.productId,
          quantity: eventData.quantity,
          timestamp
        })
        await analytics.save()
        break

      case 'error':
        analytics.errors.push({
          type: eventData.type,
          message: eventData.message,
          page,
          timestamp,
          stack: eventData.stack
        })
        await analytics.save()
        break

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid event type'
        })
    }

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    logger.error(`Track event error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Track stress event
// @route   POST /api/analytics/stress-event
// @access  Private
export const trackStressEvent = async (req, res) => {
  try {
    const {
      sessionId,
      type,
      severity = 'medium',
      page,
      context = {},
      interventionShown = false,
      interventionType
    } = req.body

    // Find analytics session
    let analytics = await Analytics.findOne({ 
      sessionId,
      user: req.user._id 
    })

    if (!analytics) {
      analytics = new Analytics({
        user: req.user._id,
        sessionId
      })
    }

    // Add stress event
    await analytics.addStressEvent({
      type,
      severity,
      page,
      context,
      interventionShown,
      interventionType
    })

    // Update user stress patterns
    const user = await User.findById(req.user._id)
    const existingPattern = user.stressPatterns.find(p => p.type === type)
    
    if (existingPattern) {
      existingPattern.frequency += 1
      existingPattern.lastDetected = new Date()
      existingPattern.severity = severity
    } else {
      user.stressPatterns.push({
        type,
        frequency: 1,
        lastDetected: new Date(),
        severity
      })
    }

    await user.save()

    logger.info(`Stress event tracked: ${type} for user ${req.user._id}`)

    res.status(200).json({
      success: true,
      message: 'Stress event tracked',
      stressLevel: analytics.stressLevel,
      stressScore: analytics.stressScore
    })
  } catch (error) {
    logger.error(`Track stress event error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get user analytics summary
// @route   GET /api/analytics/user-summary
// @access  Private
export const getUserSummary = async (req, res) => {
  try {
    const { dateRange } = req.query
    let dateFilter = null

    if (dateRange) {
      const [start, end] = dateRange.split(',')
      dateFilter = { start, end }
    }

    const summary = await Analytics.getUserSummary(req.user._id, dateFilter)

    // Get user stress patterns
    const user = await User.findById(req.user._id).select('stressPatterns')

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        stressPatterns: user.stressPatterns
      }
    })
  } catch (error) {
    logger.error(`Get user summary error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    End analytics session
// @route   POST /api/analytics/end-session
// @access  Public (with optional auth)
export const endSession = async (req, res) => {
  try {
    const { sessionId, exitPage, exitReason = 'natural' } = req.body

    const analytics = await Analytics.findOne({ sessionId })
    
    if (analytics) {
      await analytics.endSession(exitPage, exitReason)
      
      logger.debug(`Analytics session ended: ${sessionId}`)
    }

    res.status(200).json({
      success: true,
      message: 'Session ended'
    })
  } catch (error) {
    logger.error(`End session error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get accessibility insights
// @route   GET /api/analytics/accessibility-insights
// @access  Private
export const getAccessibilityInsights = async (req, res) => {
  try {
    const insights = await Analytics.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$accessibilityUsage' },
      {
        $group: {
          _id: '$accessibilityUsage.feature',
          totalUsage: { $sum: 1 },
          averageDuration: { $avg: '$accessibilityUsage.sessionDuration' },
          lastUsed: { $max: '$accessibilityUsage.timestamp' }
        }
      },
      { $sort: { totalUsage: -1 } }
    ])

    res.status(200).json({
      success: true,
      data: insights
    })
  } catch (error) {
    logger.error(`Get accessibility insights error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get stress detection insights
// @route   GET /api/analytics/stress-insights
// @access  Private
export const getStressInsights = async (req, res) => {
  try {
    const insights = await Analytics.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$stressEvents' },
      {
        $group: {
          _id: {
            type: '$stressEvents.type',
            severity: '$stressEvents.severity'
          },
          count: { $sum: 1 },
          lastOccurrence: { $max: '$stressEvents.timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Get recent stress trends
    const recentTrends = await Analytics.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          averageStressScore: { $avg: '$stressScore' },
          stressLevel: { $first: '$stressLevel' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ])

    res.status(200).json({
      success: true,
      data: {
        stressPatterns: insights,
        recentTrends: recentTrends.reverse()
      }
    })
  } catch (error) {
    logger.error(`Get stress insights error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// Helper function to determine device type
function getDeviceType(userAgent) {
  if (!userAgent) return 'desktop'
  
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  }
  
  return 'desktop'
}
