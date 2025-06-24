import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { logger } from '../utils/logger.js'

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stock isActive')

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] })
      await cart.save()
    }

    // Filter out inactive products or out of stock items
    const validItems = cart.items.filter(item => 
      item.product && item.product.isActive && item.product.stock > 0
    )

    if (validItems.length !== cart.items.length) {
      cart.items = validItems
      cart.calculateTotals()
      await cart.save()
    }

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    logger.error(`Get cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching cart'
    })
  }
}

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      })
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      })
    }

    // Check if product exists and is available
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.stock} items available in stock`
      })
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] })
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId.toString()
    )

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more available.`
        })
      }
      existingItem.quantity = newQuantity
      existingItem.addedAt = new Date()
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        addedAt: new Date()
      })
    }

    cart.calculateTotals()
    await cart.save()

    // Populate the cart for response
    await cart.populate('items.product', 'name price images stock isActive')

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    })
  } catch (error) {
    logger.error(`Add to cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while adding item to cart'
    })
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and quantity are required'
      })
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative'
      })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.removeItem(productId)
    } else {
      // Check stock availability
      const product = await Product.findById(productId)
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        })
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          error: `Only ${product.stock} items available in stock`
        })
      }

      // Update quantity
      const updated = cart.updateItemQuantity(productId, quantity)
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Item not found in cart'
        })
      }
    }

    await cart.save()
    await cart.populate('items.product', 'name price images stock isActive')

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    })
  } catch (error) {
    logger.error(`Update cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while updating cart'
    })
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    cart.removeItem(productId)
    await cart.save()
    await cart.populate('items.product', 'name price images stock isActive')

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    })
  } catch (error) {
    logger.error(`Remove from cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while removing item from cart'
    })
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }

    cart.clearCart()
    await cart.save()

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    })
  } catch (error) {
    logger.error(`Clear cart error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error while clearing cart'
    })
  }
}
