import { User, Product } from '../models/index.js'
import { logger } from '../utils/logger.js'

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images rating reviewCount')

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'avatar'
    ]

    const updateData = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    )

    logger.info(`User profile updated: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    })
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update accessibility preferences
// @route   PUT /api/users/accessibility
// @access  Private
export const updateAccessibilityPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    // Update accessibility preferences
    user.accessibilityPreferences = {
      ...user.accessibilityPreferences,
      ...req.body
    }

    await user.save()

    logger.info(`Accessibility preferences updated for user: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Accessibility preferences updated',
      data: user.accessibilityPreferences
    })
  } catch (error) {
    logger.error(`Update accessibility preferences error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Complete onboarding
// @route   PUT /api/users/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const { accessibilityPreferences } = req.body

    const user = await User.findById(req.user._id)
    
    user.isOnboarded = true
    if (accessibilityPreferences) {
      user.accessibilityPreferences = {
        ...user.accessibilityPreferences,
        ...accessibilityPreferences
      }
    }

    await user.save()

    logger.info(`Onboarding completed for user: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: user
    })
  } catch (error) {
    logger.error(`Complete onboarding error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price originalPrice images rating reviewCount brand category inStock')

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    })
  } catch (error) {
    logger.error(`Get wishlist error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const user = await User.findById(req.user._id)

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      })
    }

    user.wishlist.push(productId)
    await user.save()

    // Update product wishlist count
    product.wishlistCount += 1
    await product.save()

    logger.info(`User ${req.user._id} added product ${productId} to wishlist`)

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    })
  } catch (error) {
    logger.error(`Add to wishlist error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    const user = await User.findById(req.user._id)

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product not in wishlist'
      })
    }

    user.wishlist.pull(productId)
    await user.save()

    // Update product wishlist count
    const product = await Product.findById(productId)
    if (product) {
      product.wishlistCount = Math.max(0, product.wishlistCount - 1)
      await product.save()
    }

    logger.info(`User ${req.user._id} removed product ${productId} from wishlist`)

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    })
  } catch (error) {
    logger.error(`Remove from wishlist error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    const newAddress = {
      type: req.body.type || 'home',
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country || 'United States',
      isDefault: req.body.isDefault || false
    }

    // If this is set as default, unset other defaults
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    user.addresses.push(newAddress)
    await user.save()

    logger.info(`User ${req.user._id} added new address`)

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    })
  } catch (error) {
    logger.error(`Add address error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update user address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const address = user.addresses.id(addressId)
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        address[key] = req.body[key]
      }
    })

    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false
        }
      })
    }

    await user.save()

    logger.info(`User ${req.user._id} updated address ${addressId}`)

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    })
  } catch (error) {
    logger.error(`Update address error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const address = user.addresses.id(addressId)
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    user.addresses.pull(addressId)
    await user.save()

    logger.info(`User ${req.user._id} deleted address ${addressId}`)

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    })
  } catch (error) {
    logger.error(`Delete address error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
