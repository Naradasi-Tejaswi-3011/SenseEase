import nodemailer from 'nodemailer'
import { logger } from './logger.js'

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Welcome to SenseEase - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">SenseEase</h1>
          <p style="color: #6b7280; margin: 5px 0;">Accessible Shopping for Everyone</p>
        </div>
        
        <h2 style="color: #1f2937;">Welcome, ${data.firstName}!</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Thank you for joining SenseEase! We're excited to help you discover a more accessible shopping experience.
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          To get started, please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${data.verificationUrl}" style="color: #2563eb;">${data.verificationUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This verification link will expire in 24 hours. If you didn't create an account with SenseEase, please ignore this email.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'SenseEase Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">SenseEase</h1>
          <p style="color: #6b7280; margin: 5px 0;">Accessible Shopping for Everyone</p>
        </div>
        
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Hello ${data.firstName},
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          We received a request to reset your password for your SenseEase account. If you made this request, click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${data.resetUrl}" style="color: #dc2626;">${data.resetUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      </div>
    `
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">SenseEase</h1>
          <p style="color: #6b7280; margin: 5px 0;">Order Confirmation</p>
        </div>
        
        <h2 style="color: #1f2937;">Thank you for your order!</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Hello ${data.firstName},
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          Your order has been confirmed and is being processed. Here are your order details:
        </p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">Order #${data.orderNumber}</h3>
          <p style="color: #6b7280; margin: 0;">Order Date: ${new Date(data.orderDate).toLocaleDateString()}</p>
          <p style="color: #6b7280; margin: 0;">Total: $${data.total.toFixed(2)}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          We'll send you another email when your order ships with tracking information.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/orders/${data.orderNumber}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Order Details
          </a>
        </div>
      </div>
    `
  })
}

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, use a test account or log emails
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    })
  }

  // Production email configuration
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Send email function
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter()

    let emailContent = {}

    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data)
    } else if (html || text) {
      emailContent = { subject, html, text }
    } else {
      throw new Error('No email content provided')
    }

    const mailOptions = {
      from: `SenseEase <${process.env.EMAIL_FROM || 'noreply@senseease.com'}>`,
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html,
      text: emailContent.text
    }

    if (process.env.NODE_ENV === 'development') {
      // In development, just log the email
      logger.info('📧 Email would be sent:')
      logger.info(`To: ${to}`)
      logger.info(`Subject: ${mailOptions.subject}`)
      logger.info(`Content: ${emailContent.html ? 'HTML content' : emailContent.text}`)
      return { success: true, messageId: 'dev-mode' }
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`📧 Email sent successfully to ${to}: ${info.messageId}`)
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    logger.error(`📧 Email sending failed: ${error.message}`)
    throw error
  }
}

// Send bulk emails
export const sendBulkEmail = async (emails) => {
  const results = []
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email)
      results.push({ ...email, success: true, result })
    } catch (error) {
      results.push({ ...email, success: false, error: error.message })
    }
  }
  
  return results
}

// Email verification helper
export const sendVerificationEmail = async (user) => {
  const verificationToken = user.getEmailVerificationToken()
  await user.save()

  return sendEmail({
    to: user.email,
    template: 'emailVerification',
    data: {
      firstName: user.firstName,
      verificationToken,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    }
  })
}

// Password reset helper
export const sendPasswordResetEmail = async (user) => {
  const resetToken = user.getResetPasswordToken()
  await user.save()

  return sendEmail({
    to: user.email,
    template: 'passwordReset',
    data: {
      firstName: user.firstName,
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    }
  })
}
