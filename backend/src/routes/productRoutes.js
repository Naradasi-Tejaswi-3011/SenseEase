import express from 'express'
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  searchProducts
} from '../controllers/productController.js'
import seedProducts from '../utils/seedProducts.js'
import Product from '../models/Product.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Seed products endpoint (for development)
router.post('/seed', async (req, res) => {
  try {
    await seedProducts()
    res.status(200).json({
      success: true,
      message: 'Products seeded successfully'
    })
  } catch (error) {
    logger.error(`Seed products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Failed to seed products'
    })
  }
})

// Update stock endpoint (for development)
router.post('/update-stock', async (req, res) => {
  try {
    // Update all products to have stock > 0
    const result = await Product.updateMany(
      { stock: { $lte: 0 } },
      { $set: { stock: 50 } }
    )

    // Also ensure all products are active
    await Product.updateMany(
      { isActive: { $ne: true } },
      { $set: { isActive: true } }
    )

    logger.info(`Updated stock for ${result.modifiedCount} products`)

    res.status(200).json({
      success: true,
      message: `Updated stock for ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    logger.error(`Update stock error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    })
  }
})

// Public routes
router.get('/search', searchProducts)
router.get('/featured', getFeaturedProducts)
router.get('/categories', getCategories)
router.get('/:id', getProduct)
router.get('/', getProducts)

export default router
