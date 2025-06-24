import express from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/authMiddleware.js'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary
} from '../controllers/cartController.js'

const router = express.Router()

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
]

const updateCartValidation = [
  body('quantity')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10')
]

const couponValidation = [
  body('couponCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
]

// All routes require authentication
router.use(protect)

// Cart routes
router.get('/summary', getCartSummary)
router.get('/', getCart)
router.post('/add', addToCartValidation, addToCart)
router.put('/update/:itemId', updateCartValidation, updateCartItem)
router.delete('/remove/:itemId', removeFromCart)
router.delete('/clear', clearCart)

// Coupon routes
router.post('/coupon', couponValidation, applyCoupon)
router.delete('/coupon/:couponCode', removeCoupon)

export default router
