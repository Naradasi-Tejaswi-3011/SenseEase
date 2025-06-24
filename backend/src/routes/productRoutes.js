import express from 'express'
import { body } from 'express-validator'
import { optionalAuth, protect } from '../middleware/authMiddleware.js'
import {
  getProducts,
  getProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getRecommendations,
  addReview
} from '../controllers/productController.js'

const router = express.Router()

// Review validation
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
]

// Public routes
router.get('/search', optionalAuth, searchProducts)
router.get('/featured', optionalAuth, getFeaturedProducts)
router.get('/category/:category', optionalAuth, getProductsByCategory)
router.get('/:id/recommendations', optionalAuth, getRecommendations)
router.get('/:id', optionalAuth, getProduct)
router.get('/', optionalAuth, getProducts)

// Protected routes
router.post('/:id/reviews', protect, reviewValidation, addReview)

export default router
