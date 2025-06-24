import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Placeholder routes
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'User profile endpoint' })
})

export default router
