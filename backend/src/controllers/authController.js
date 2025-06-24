import { User } from '../models/index.js'
import { logger } from '../utils/logger.js'
import { sendEmail } from '../utils/emailService.js'
import { validationResult } from 'express-validator'

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }

  // Update login stats
  user.lastLogin = new Date()
  user.loginCount += 1
  user.save().catch(err => logger.error(`Failed to update login stats: ${err.message}`))

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isOnboarded: user.isOnboarded,
        accessibilityPreferences: user.accessibilityPreferences,
        avatar: user.avatar
      }
    })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { firstName, lastName, email, password, phone, dateOfBirth } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      dateOfBirth
    })

    logger.info(`New user registered: ${user.email}`)

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken()
    await user.save()

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to SenseEase - Verify Your Email',
        template: 'emailVerification',
        data: {
          firstName: user.firstName,
          verificationToken,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      })
    } catch (emailError) {
      logger.error(`Failed to send verification email: ${emailError.message}`)
      // Don't fail registration if email fails
    }

    sendTokenResponse(user, 201, res, 'User registered successfully. Please check your email for verification.')
  } catch (error) {
    logger.error(`Registration error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated. Please contact support.'
      })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    logger.info(`User logged in: ${user.email}`)
    sendTokenResponse(user, 200, res, 'Login successful')
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    })
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  logger.info(`User logged out: ${req.user?.email}`)

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name price images rating')

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error(`Get me error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    )

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    })

    logger.info(`User details updated: ${user.email}`)

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error(`Update details error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password')

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    user.password = req.body.newPassword
    await user.save()

    logger.info(`Password updated for user: ${user.email}`)
    sendTokenResponse(user, 200, res, 'Password updated successfully')
  } catch (error) {
    logger.error(`Update password error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email'
      })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    try {
      await sendEmail({
        to: user.email,
        subject: 'SenseEase Password Reset',
        template: 'passwordReset',
        data: {
          firstName: user.firstName,
          resetUrl,
          resetToken
        }
      })

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      })
    } catch (emailError) {
      logger.error(`Failed to send reset email: ${emailError.message}`)
      
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      })
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.resettoken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    logger.info(`Password reset for user: ${user.email}`)
    sendTokenResponse(user, 200, res, 'Password reset successful')
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpire = undefined
    await user.save()

    logger.info(`Email verified for user: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`)
    res.status(500).json({
      success: false,
      error: 'Server error'
    })
  }
}
