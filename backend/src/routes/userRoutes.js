import express from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/authMiddleware.js'
import {
  getProfile,
  updateProfile,
  updateAccessibilityPreferences,
  completeOnboarding,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js'

const router = express.Router()

// Validation rules
const addressValidation = [
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
]

// All routes require authentication
router.use(protect)

// Profile routes
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/accessibility', updateAccessibilityPreferences)
router.put('/onboarding', completeOnboarding)

// Wishlist routes
router.get('/wishlist', getWishlist)
router.post('/wishlist/:productId', addToWishlist)
router.delete('/wishlist/:productId', removeFromWishlist)

// Address routes
router.post('/addresses', addressValidation, addAddress)
router.put('/addresses/:addressId', updateAddress)
router.delete('/addresses/:addressId', deleteAddress)

export default router
