import express from 'express'
import { body } from 'express-validator'
import { protect, authorize } from '../middleware/authMiddleware.js'
import {
  getDashboard,
  getUsers,
  getOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalytics
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(authorize('admin'))

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Grocery', 'Electronics', 'Home', 'Clothing', 'Household Essentials', 'Sports & Outdoors'])
    .withMessage('Valid category is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
]

const orderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'])
    .withMessage('Valid order status is required')
]

// Dashboard and analytics
router.get('/dashboard', getDashboard)
router.get('/analytics', getAnalytics)

// User management
router.get('/users', getUsers)

// Order management
router.get('/orders', getOrders)
router.put('/orders/:orderId/status', orderStatusValidation, updateOrderStatus)

// Product management
router.post('/products', productValidation, createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

export default router
