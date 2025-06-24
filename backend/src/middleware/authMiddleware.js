import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { logger } from '../utils/logger.js'

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  let token

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        })
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated'
        })
      }

      next()
    } catch (error) {
      logger.error(`Auth middleware error: ${error.message}`)
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        })
      }
      
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    })
  }
}

// Optional authentication - don't require token but decode if present
export const optionalAuth = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
      // Don't fail if token is invalid, just continue without user
      logger.debug(`Optional auth failed: ${error.message}`)
    }
  }

  next()
}

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      })
    }

    next()
  }
}

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next()
    }

    // Check if user owns the resource
    const resourceUserId = req.resource ? req.resource[resourceUserField] : req.params.userId
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      })
    }

    next()
  }
}

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (req, res, next) => {
  // This would typically integrate with Redis for distributed rate limiting
  // For now, we'll use a simple in-memory approach
  const key = `${req.ip}-${req.user?._id || 'anonymous'}`
  
  // In production, implement proper rate limiting with Redis
  // For now, just log and continue
  logger.debug(`Sensitive operation attempted by ${key}`)
  
  next()
}

// Middleware to check email verification
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email address to access this feature',
      code: 'EMAIL_NOT_VERIFIED'
    })
  }
  
  next()
}

// Middleware to log user activity
export const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      logger.info(`User ${req.user._id} performed action: ${action}`)
      
      // Update last activity
      req.user.lastLogin = new Date()
      req.user.save().catch(err => {
        logger.error(`Failed to update user activity: ${err.message}`)
      })
    }
    
    next()
  }
}

// Middleware to validate API key for external integrations
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    })
  }
  
  // In production, validate against stored API keys
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    })
  }
  
  next()
}
