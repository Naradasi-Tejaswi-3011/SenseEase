import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'
import { logger } from './logger.js'

dotenv.config()

const sampleProducts = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium wireless headphones with active noise cancellation, perfect for focus and concentration. Features accessibility controls and voice guidance.",
    price: 299.99,
    originalPrice: 349.99,
    category: "Electronics",
    subcategory: "Audio",
    brand: "SenseSound",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        alt: "Black wireless noise-cancelling headphones",
        isPrimary: true
      }
    ],
    stock: 50,
    tags: ["wireless", "noise-cancelling", "bluetooth", "accessible"],
    features: [
      { name: "Battery Life", value: "30 hours" },
      { name: "Noise Cancellation", value: "Active ANC" },
      { name: "Voice Assistant", value: "Built-in" }
    ],
    isFeatured: true,
    isOnSale: true,
    accessibilityFeatures: {
      isAccessible: true,
      features: ["voice-control", "large-text-support", "cognitive-friendly"]
    }
  },
  {
    name: "Ergonomic Wireless Mouse",
    description: "Specially designed ergonomic mouse with customizable buttons and high-contrast LED indicators for users with motor difficulties.",
    price: 79.99,
    category: "Electronics",
    subcategory: "Computer Accessories",
    brand: "ErgoTech",
    images: [
      {
        url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        alt: "Ergonomic wireless computer mouse",
        isPrimary: true
      }
    ],
    stock: 75,
    tags: ["ergonomic", "wireless", "accessible", "customizable"],
    features: [
      { name: "DPI", value: "1600" },
      { name: "Buttons", value: "6 programmable" },
      { name: "Battery", value: "Rechargeable" }
    ],
    isFeatured: true,
    accessibilityFeatures: {
      isAccessible: true,
      features: ["one-handed-operation", "high-contrast-display"]
    }
  },
  {
    name: "Smart LED Desk Lamp",
    description: "Adjustable LED desk lamp with eye-care technology, multiple brightness levels, and color temperature control for reduced eye strain.",
    price: 89.99,
    category: "Home & Garden",
    subcategory: "Lighting",
    brand: "BrightCare",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        alt: "Modern LED desk lamp with adjustable arm",
        isPrimary: true
      }
    ],
    stock: 30,
    tags: ["LED", "adjustable", "eye-care", "smart"],
    features: [
      { name: "Brightness Levels", value: "10 levels" },
      { name: "Color Temperature", value: "3000K-6500K" },
      { name: "USB Charging", value: "Built-in port" }
    ],
    accessibilityFeatures: {
      isAccessible: true,
      features: ["high-contrast-display", "sensory-friendly"]
    }
  },
  {
    name: "Large Print Keyboard",
    description: "High-contrast keyboard with large, clearly marked keys and tactile feedback. Perfect for users with visual impairments or dyslexia.",
    price: 59.99,
    category: "Electronics",
    subcategory: "Computer Accessories",
    brand: "AccessKeys",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop",
        alt: "Large print keyboard with high contrast keys",
        isPrimary: true
      }
    ],
    stock: 40,
    tags: ["large-print", "high-contrast", "tactile", "accessible"],
    features: [
      { name: "Key Size", value: "Extra Large" },
      { name: "Contrast", value: "High Contrast" },
      { name: "Connection", value: "USB Wired" }
    ],
    isFeatured: true,
    accessibilityFeatures: {
      isAccessible: true,
      features: ["large-text-support", "high-contrast-display", "cognitive-friendly"]
    }
  },
  {
    name: "Stress Relief Fidget Cube",
    description: "Multi-sensory fidget cube designed for stress relief and focus enhancement. Great for ADHD, anxiety, and autism support.",
    price: 19.99,
    category: "Health & Beauty",
    subcategory: "Wellness",
    brand: "CalmCube",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop",
        alt: "Colorful fidget cube with various textures",
        isPrimary: true
      }
    ],
    stock: 100,
    tags: ["fidget", "stress-relief", "sensory", "focus"],
    features: [
      { name: "Sides", value: "6 different activities" },
      { name: "Material", value: "Safe ABS plastic" },
      { name: "Size", value: "Pocket-sized" }
    ],
    accessibilityFeatures: {
      isAccessible: true,
      features: ["sensory-friendly", "cognitive-friendly"]
    }
  },
  {
    name: "Voice-Controlled Smart Speaker",
    description: "Smart speaker with enhanced voice recognition and accessibility features. Supports multiple languages and clear audio feedback.",
    price: 149.99,
    category: "Electronics",
    subcategory: "Smart Home",
    brand: "VoiceAssist",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        alt: "Cylindrical smart speaker in white",
        isPrimary: true
      }
    ],
    stock: 60,
    tags: ["smart-speaker", "voice-control", "accessible", "AI"],
    features: [
      { name: "Voice Recognition", value: "Advanced AI" },
      { name: "Audio Quality", value: "360° sound" },
      { name: "Connectivity", value: "WiFi & Bluetooth" }
    ],
    isFeatured: true,
    accessibilityFeatures: {
      isAccessible: true,
      features: ["voice-control", "screen-reader-compatible", "cognitive-friendly"]
    }
  },
  {
    name: "Weighted Blanket for Anxiety Relief",
    description: "Therapeutic weighted blanket designed to reduce anxiety and improve sleep quality. Made with breathable, hypoallergenic materials.",
    price: 129.99,
    category: "Home & Garden",
    subcategory: "Bedding",
    brand: "CalmSleep",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
        alt: "Gray weighted blanket on a bed",
        isPrimary: true
      }
    ],
    stock: 25,
    tags: ["weighted", "anxiety-relief", "therapeutic", "sleep"],
    features: [
      { name: "Weight", value: "15 lbs" },
      { name: "Material", value: "Cotton & glass beads" },
      { name: "Size", value: "60\" x 80\"" }
    ],
    accessibilityFeatures: {
      isAccessible: true,
      features: ["sensory-friendly", "cognitive-friendly"]
    }
  },
  {
    name: "High-Contrast Reading Glasses",
    description: "Specially designed reading glasses with anti-glare coating and high-contrast frames for enhanced visual clarity.",
    price: 49.99,
    category: "Health & Beauty",
    subcategory: "Vision Care",
    brand: "ClearVision",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&h=500&fit=crop",
        alt: "Black-framed reading glasses",
        isPrimary: true
      }
    ],
    stock: 80,
    tags: ["reading-glasses", "high-contrast", "anti-glare", "vision"],
    features: [
      { name: "Magnification", value: "+2.0" },
      { name: "Coating", value: "Anti-glare" },
      { name: "Frame", value: "High-contrast black" }
    ],
    accessibilityFeatures: {
      isAccessible: true,
      features: ["high-contrast-display", "large-text-support"]
    }
  }
]

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('Connected to MongoDB for seeding')

    // Clear existing products
    await Product.deleteMany({})
    logger.info('Cleared existing products')

    // Insert sample products
    const products = await Product.insertMany(sampleProducts)
    logger.success(`Successfully seeded ${products.length} products`)

    process.exit(0)
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts()
}

// Alternative function to just update stock levels
export const updateProductStock = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('Connected to MongoDB for stock update')

    // Update all products to have stock > 0
    const result = await Product.updateMany(
      { stock: { $lte: 0 } },
      { $set: { stock: 50 } }
    )

    logger.success(`Updated stock for ${result.modifiedCount} products`)

    // Also ensure all products are active
    await Product.updateMany(
      { isActive: { $ne: true } },
      { $set: { isActive: true } }
    )

    process.exit(0)
  } catch (error) {
    logger.error(`Stock update error: ${error.message}`)
    process.exit(1)
  }
}

export default seedProducts
