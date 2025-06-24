import Product from '../models/Product.js'
import { logger } from '../utils/logger.js'

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { isActive: true }
    
    if (req.query.category) {
      filter.category = req.query.category
    }
    
    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory
    }
    
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i')
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice)
    }
    
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 }
    }
    
    if (req.query.featured === 'true') {
      filter.isFeatured = true
    }
    
    if (req.query.onSale === 'true') {
      filter.isOnSale = true
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    // Build sort object
    let sort = {}
    switch (req.query.sortBy) {
      case 'price-low':
        sort = { price: 1 }
        break
      case 'price-high':
        sort = { price: -1 }
        break
      case 'rating':
        sort = { rating: -1 }
        break
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'name':
        sort = { name: 1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews')

    const total = await Product.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    logger.error(`Get products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching products'
    })
  }
}

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName')

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    logger.error(`Get product error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching product'
    })
  }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true,
      stock: { $gt: 0 }
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .select('-reviews')

    res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    logger.error(`Get featured products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching featured products'
    })
  }
}

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    res.status(200).json({
      success: true,
      data: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    })
  } catch (error) {
    logger.error(`Get categories error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories'
    })
  }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const filter = {
      isActive: true,
      $text: { $search: q }
    }
    
    if (category) filter.category = category
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    const products = await Product.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews')

    const total = await Product.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    })
  } catch (error) {
    logger.error(`Search products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while searching products'
    })
  }
}
