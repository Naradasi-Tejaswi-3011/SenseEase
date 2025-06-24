import { Order, Cart, Product } from '../models/index.js'
import { logger } from '../utils/logger.js'
import { sendEmail } from '../utils/emailService.js'

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { user: req.user._id }
    
    if (req.query.status) {
      filter.status = req.query.status
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images brand')

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

// @desc    Get single order
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product', 'name images brand')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    logger.error(`Get order error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Create order from cart
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod = 'standard',
      customerNotes = '',
      accessibilityRequests = {}
    } = req.body

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      })
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id)
      if (!product || !product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product?.name || 'product'}`
        })
      }
    }

    // Create order items with product snapshots
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: {
        name: item.product.name,
        description: item.product.description,
        image: item.product.images[0]?.url,
        brand: item.product.brand,
        sku: item.product.sku
      },
      quantity: item.quantity,
      price: item.price,
      selectedVariants: item.selectedVariants,
      total: item.price * item.quantity
    }))

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      appliedCoupons: cart.appliedCoupons,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      },
      shippingMethod,
      customerNotes,
      accessibilityRequests
    })

    await order.save()

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: -item.quantity, purchaseCount: item.quantity } }
      )
    }

    // Clear cart
    await cart.clearCart()

    // Send order confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        template: 'orderConfirmation',
        data: {
          firstName: req.user.firstName,
          orderNumber: order.orderNumber,
          orderDate: order.orderDate,
          total: order.total
        }
      })
    } catch (emailError) {
      logger.error(`Failed to send order confirmation email: ${emailError.message}`)
    }

    logger.info(`Order created: ${order.orderNumber} for user ${req.user._id}`)

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    })
  } catch (error) {
    logger.error(`Create order error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      })
    }

    // Update order status
    await order.updateStatus('cancelled', req.body.reason || 'Cancelled by customer')

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity, purchaseCount: -item.quantity } }
      )
    }

    logger.info(`Order cancelled: ${order.orderNumber} by user ${req.user._id}`)

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    })
  } catch (error) {
    logger.error(`Cancel order error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Request return
// @route   PUT /api/orders/:orderId/return
// @access  Private
export const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body
    
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check if order can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Only delivered orders can be returned'
      })
    }

    // Check return window (30 days)
    const returnWindow = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    if (Date.now() - order.deliveredAt.getTime() > returnWindow) {
      return res.status(400).json({
        success: false,
        error: 'Return window has expired'
      })
    }

    await order.requestReturn(reason)

    logger.info(`Return requested for order: ${order.orderNumber} by user ${req.user._id}`)

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: order
    })
  } catch (error) {
    logger.error(`Request return error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats(req.user._id)

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    logger.error(`Get order stats error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Track order
// @route   GET /api/orders/:orderId/tracking
// @access  Private
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).select('orderNumber status trackingInfo shippedAt deliveredAt')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingInfo: order.trackingInfo,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt
      }
    })
  } catch (error) {
    logger.error(`Track order error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
