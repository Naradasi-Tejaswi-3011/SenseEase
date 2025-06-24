import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Placeholder routes
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Orders endpoint', data: [] })
})

export default router
