import { User, Product, Order, Analytics } from '../models/index.js'
import { logger } from '../utils/logger.js'

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboard = async (req, res) => {
  try {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get basic counts
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalOrders = await Order.countDocuments()

    // Get recent stats
    const newUsersThisWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: lastWeek }
    })

    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: lastMonth }
    })

    // Get revenue data
    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ])

    // Get top products
    const topProducts = await Product.find({ isActive: true })
      .sort({ purchaseCount: -1, rating: -1 })
      .limit(5)
      .select('name purchaseCount rating reviewCount price')

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email')
      .select('orderNumber total status createdAt user')

    // Get stress detection stats
    const stressStats = await Analytics.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: '$stressLevel',
          count: { $sum: 1 }
        }
      }
    ])

    // Get accessibility usage stats
    const accessibilityStats = await Analytics.aggregate([
      { $unwind: '$accessibilityUsage' },
      {
        $group: {
          _id: '$accessibilityUsage.feature',
          usage: { $sum: 1 }
        }
      },
      { $sort: { usage: -1 } },
      { $limit: 10 }
    ])

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          newUsersThisWeek,
          ordersThisMonth,
          revenueThisMonth: revenueThisMonth[0]?.total || 0
        },
        topProducts,
        recentOrders,
        stressStats,
        accessibilityStats
      }
    })
  } catch (error) {
    logger.error(`Get dashboard error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.role) {
      filter.role = req.query.role
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true'
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    })
  } catch (error) {
    logger.error(`Get users error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders
    })
  } catch (error) {
    logger.error(`Get orders error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    
    const order = await Order.findById(req.params.orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    await order.updateStatus(status, notes)

    logger.info(`Admin ${req.user._id} updated order ${order.orderNumber} status to ${status}`)

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    })
  } catch (error) {
    logger.error(`Update order status error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    }

    const product = await Product.create(productData)

    logger.info(`Admin ${req.user._id} created product: ${product.name}`)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  } catch (error) {
    logger.error(`Create product error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    )

    logger.info(`Admin ${req.user._id} updated product: ${updatedProduct.name}`)

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    })
  } catch (error) {
    logger.error(`Update product error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Soft delete - just mark as inactive
    product.isActive = false
    product.updatedBy = req.user._id
    await product.save()

    logger.info(`Admin ${req.user._id} deleted product: ${product.name}`)

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    logger.error(`Delete product error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get analytics overview
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const { dateRange } = req.query
    let dateFilter = {}

    if (dateRange) {
      const [start, end] = dateRange.split(',')
      dateFilter = {
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      }
    }

    // Get platform stats
    const platformStats = await Analytics.getPlatformStats(
      dateRange ? { start: dateRange.split(',')[0], end: dateRange.split(',')[1] } : null
    )

    // Get stress patterns across all users
    const stressPatterns = await Analytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$stressEvents' },
      {
        $group: {
          _id: '$stressEvents.type',
          count: { $sum: 1 },
          averageSeverity: { $avg: { $cond: [
            { $eq: ['$stressEvents.severity', 'high'] }, 3,
            { $cond: [{ $eq: ['$stressEvents.severity', 'medium'] }, 2, 1] }
          ]}}
        }
      },
      { $sort: { count: -1 } }
    ])

    // Get accessibility feature usage
    const accessibilityUsage = await Analytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$accessibilityUsage' },
      {
        $group: {
          _id: '$accessibilityUsage.feature',
          totalUsage: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          feature: '$_id',
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { totalUsage: -1 } }
    ])

    res.status(200).json({
      success: true,
      data: {
        platformStats,
        stressPatterns,
        accessibilityUsage
      }
    })
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
