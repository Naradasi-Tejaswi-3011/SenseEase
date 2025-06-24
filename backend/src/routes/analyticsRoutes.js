import express from 'express'
import { body } from 'express-validator'
import { protect, optionalAuth } from '../middleware/authMiddleware.js'
import {
  trackEvent,
  trackStressEvent,
  getUserSummary,
  endSession,
  getAccessibilityInsights,
  getStressInsights
} from '../controllers/analyticsController.js'

const router = express.Router()

// Validation rules
const trackEventValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('eventType')
    .isIn(['page_view', 'interaction', 'stress_event', 'accessibility_usage', 'search', 'cart_event', 'error'])
    .withMessage('Valid event type is required')
]

const stressEventValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('type')
    .isIn(['rapid_navigation', 'long_pauses', 'failed_submissions', 'erratic_scrolling', 'repeated_clicks', 'back_button_usage', 'form_abandonment', 'search_frustration'])
    .withMessage('Valid stress event type is required'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Severity must be low, medium, or high')
]

// Public routes (with optional auth)
router.post('/track', optionalAuth, trackEventValidation, trackEvent)
router.post('/end-session', optionalAuth, endSession)

// Protected routes
router.post('/stress-event', protect, stressEventValidation, trackStressEvent)
router.get('/user-summary', protect, getUserSummary)
router.get('/accessibility-insights', protect, getAccessibilityInsights)
router.get('/stress-insights', protect, getStressInsights)

export default router
