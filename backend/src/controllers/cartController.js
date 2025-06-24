import { Cart, Product } from '../models/index.js'
import { logger } from '../utils/logger.js'

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user._id)
    
    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    logger.error(`Get cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariants = [] } = req.body

    // Validate product exists and is available
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      })
    }

    // Get or create cart
    const cart = await Cart.findOrCreateForUser(req.user._id)

    // Add item to cart
    await cart.addItem(productId, quantity, product.price, selectedVariants)

    // Populate the cart with product details
    await cart.populate('items.product', 'name price images brand inStock stockQuantity')

    logger.info(`User ${req.user._id} added product ${productId} to cart`)

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    })
  } catch (error) {
    logger.error(`Add to cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative'
      })
    }

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    // Check if item exists in cart
    const item = cart.items.id(itemId)
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      })
    }

    // Check stock availability if increasing quantity
    if (quantity > item.quantity) {
      const product = await Product.findById(item.product)
      if (!product || !product.inStock || product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient stock'
        })
      }
    }

    await cart.updateItemQuantity(itemId, quantity)
    await cart.populate('items.product', 'name price images brand inStock stockQuantity')

    logger.info(`User ${req.user._id} updated cart item ${itemId} quantity to ${quantity}`)

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart
    })
  } catch (error) {
    logger.error(`Update cart item error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    await cart.removeItem(itemId)
    await cart.populate('items.product', 'name price images brand inStock stockQuantity')

    logger.info(`User ${req.user._id} removed item ${itemId} from cart`)

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    })
  } catch (error) {
    logger.error(`Remove from cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    await cart.clearCart()

    logger.info(`User ${req.user._id} cleared their cart`)

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    })
  } catch (error) {
    logger.error(`Clear cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body

    // Simple coupon validation (in production, this would be more sophisticated)
    const validCoupons = {
      'SAVE10': { discountAmount: 10, discountType: 'percentage' },
      'WELCOME5': { discountAmount: 5, discountType: 'fixed' },
      'FREESHIP': { discountAmount: 0, discountType: 'shipping' }
    }

    const coupon = validCoupons[couponCode.toUpperCase()]
    if (!coupon) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon code'
      })
    }

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    await cart.applyCoupon(couponCode.toUpperCase(), coupon.discountAmount, coupon.discountType)
    await cart.populate('items.product', 'name price images brand')

    logger.info(`User ${req.user._id} applied coupon ${couponCode}`)

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: cart
    })
  } catch (error) {
    if (error.message === 'Coupon already applied') {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    logger.error(`Apply coupon error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon/:couponCode
// @access  Private
export const removeCoupon = async (req, res) => {
  try {
    const { couponCode } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    await cart.removeCoupon(couponCode)
    await cart.populate('items.product', 'name price images brand')

    logger.info(`User ${req.user._id} removed coupon ${couponCode}`)

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      data: cart
    })
  } catch (error) {
    logger.error(`Remove coupon error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        }
      })
    }

    res.status(200).json({
      success: true,
      data: cart.summary
    })
  } catch (error) {
    logger.error(`Get cart summary error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
