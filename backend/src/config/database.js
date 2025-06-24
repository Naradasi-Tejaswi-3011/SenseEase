import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    
    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
    })

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err}`)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        logger.info('🔒 MongoDB connection closed through app termination')
        process.exit(0)
      } catch (err) {
        logger.error(`❌ Error during MongoDB shutdown: ${err}`)
        process.exit(1)
      }
    })

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
