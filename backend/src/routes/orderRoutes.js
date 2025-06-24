import express from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/authMiddleware.js'
import {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  requestReturn,
  getOrderStats,
  trackOrder
} from '../controllers/orderController.js'

const router = express.Router()

// Validation rules
const createOrderValidation = [
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('paymentMethod')
    .isIn(['credit', 'debit', 'paypal'])
    .withMessage('Valid payment method is required')
]

const returnRequestValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Return reason must be between 10 and 500 characters')
]

// All routes require authentication
router.use(protect)

// Order routes
router.get('/stats', getOrderStats)
router.get('/:orderId/tracking', trackOrder)
router.get('/:orderId', getOrder)
router.get('/', getOrders)
router.post('/create', createOrderValidation, createOrder)
router.put('/:orderId/cancel', cancelOrder)
router.put('/:orderId/return', returnRequestValidation, requestReturn)

export default router
