import { Product } from '../models/index.js'
import { logger } from '../utils/logger.js'

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { isActive: true }
    
    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i')
    }
    
    if (req.query.subcategory) {
      filter.subcategory = new RegExp(req.query.subcategory, 'i')
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
      filter.inStock = true
    }
    
    if (req.query.featured === 'true') {
      filter.isFeatured = true
    }
    
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') }
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    // Build sort object
    let sort = {}
    if (req.query.sortBy) {
      const sortField = req.query.sortBy
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1
      sort[sortField] = sortOrder
    } else {
      sort = { createdAt: -1 } // Default sort by newest
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews') // Exclude reviews for performance

    const total = await Product.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    // Track user view if authenticated
    if (req.user) {
      // Log product views for analytics
      logger.debug(`User ${req.user._id} viewed products page`)
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: page,
      data: products
    })
  } catch (error) {
    logger.error(`Get products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName avatar')

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Increment view count
    product.viewCount += 1
    await product.save()

    // Track user view if authenticated
    if (req.user) {
      logger.debug(`User ${req.user._id} viewed product ${product._id}`)
    }

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    logger.error(`Get product error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {
      category: new RegExp(category, 'i'),
      isActive: true
    }

    if (req.query.subcategory) {
      filter.subcategory = new RegExp(req.query.subcategory, 'i')
    }

    const products = await Product.find(filter)
      .sort({ isFeatured: -1, rating: -1 })
      .skip(skip)
      .limit(limit)
      .select('-reviews')

    const total = await Product.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      data: products
    })
  } catch (error) {
    logger.error(`Get products by category error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Text search with scoring
    const products = await Product.find(
      { 
        $text: { $search: q },
        isActive: true
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' }, rating: -1 })
    .skip(skip)
    .limit(limit)
    .select('-reviews')

    const total = await Product.countDocuments({
      $text: { $search: q },
      isActive: true
    })

    // Track search if user is authenticated
    if (req.user) {
      logger.debug(`User ${req.user._id} searched for: ${q}`)
    }

    res.status(200).json({
      success: true,
      query: q,
      count: products.length,
      total,
      data: products
    })
  } catch (error) {
    logger.error(`Search products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
      inStock: true
    })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .select('-reviews')

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    })
  } catch (error) {
    logger.error(`Get featured products error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get product recommendations
// @route   GET /api/products/:id/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Find similar products based on category, tags, and price range
    const recommendations = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { 
          price: { 
            $gte: product.price * 0.7, 
            $lte: product.price * 1.3 
          } 
        }
      ],
      isActive: true,
      inStock: true
    })
    .sort({ rating: -1 })
    .limit(8)
    .select('-reviews')

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    })
  } catch (error) {
    logger.error(`Get recommendations error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body
    
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    )

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product'
      })
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      title,
      comment
    }

    product.reviews.push(review)
    product.calculateAverageRating()
    await product.save()

    logger.info(`User ${req.user._id} added review for product ${product._id}`)

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    })
  } catch (error) {
    logger.error(`Add review error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
