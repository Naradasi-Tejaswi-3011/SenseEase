import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Product } from '../models/index.js'
import { logger } from './logger.js'

// Load environment variables
dotenv.config()

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('✅ MongoDB Connected for seeding')
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

// Sample products data (from frontend)
const sampleProducts = [
  {
    name: "Great Value Organic Bananas, 2 lb",
    price: 1.98,
    originalPrice: 2.48,
    category: "Grocery",
    subcategory: "Fresh Produce",
    images: [{
      url: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      alt: "Fresh organic bananas",
      isPrimary: true
    }],
    rating: 4.3,
    reviewCount: 1247,
    stockQuantity: 150,
    description: "Fresh, organic bananas perfect for snacking or baking. Rich in potassium and naturally sweet.",
    features: ["Organic", "Fresh", "Rich in Potassium", "Naturally Sweet"],
    brand: "Great Value",
    seller: "SenseEase",
    nutritionInfo: {
      calories: 105,
      carbs: "27g",
      fiber: "3g",
      sugar: "14g"
    },
    tags: ["organic", "fruit", "healthy", "potassium"],
    isFeatured: true
  },
  {
    name: "Samsung Galaxy S24 Ultra, 256GB",
    price: 1199.99,
    originalPrice: 1299.99,
    category: "Electronics",
    subcategory: "Cell Phones",
    images: [{
      url: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      alt: "Samsung Galaxy S24 Ultra smartphone",
      isPrimary: true
    }],
    rating: 4.7,
    reviewCount: 892,
    stockQuantity: 45,
    description: "The most advanced Galaxy smartphone with AI-powered features, professional-grade camera, and S Pen included.",
    features: ["AI-Powered", "Professional Camera", "S Pen Included", "5G Ready"],
    brand: "Samsung",
    seller: "SenseEase",
    specifications: [
      { name: "Storage", value: "256GB" },
      { name: "RAM", value: "12GB" },
      { name: "Display", value: "6.8 inch Dynamic AMOLED" },
      { name: "Camera", value: "200MP Main + 50MP Telephoto + 12MP Ultra Wide" }
    ],
    tags: ["smartphone", "android", "camera", "5g"],
    isFeatured: true
  },
  {
    name: "Nike Air Max 270 Running Shoes",
    price: 129.99,
    originalPrice: 150.00,
    category: "Clothing",
    subcategory: "Shoes",
    images: [{
      url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      alt: "Nike Air Max 270 running shoes",
      isPrimary: true
    }],
    rating: 4.5,
    reviewCount: 2156,
    stockQuantity: 78,
    description: "Comfortable running shoes with Max Air cushioning for all-day comfort and style.",
    features: ["Max Air Cushioning", "Breathable Mesh", "Durable Rubber Sole", "Lightweight"],
    brand: "Nike",
    seller: "SenseEase",
    variants: [
      { name: "Size", value: "8", priceModifier: 0, stockQuantity: 15 },
      { name: "Size", value: "9", priceModifier: 0, stockQuantity: 20 },
      { name: "Size", value: "10", priceModifier: 0, stockQuantity: 25 },
      { name: "Size", value: "11", priceModifier: 0, stockQuantity: 18 }
    ],
    tags: ["running", "shoes", "nike", "athletic"],
    isFeatured: false
  },
  {
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    price: 79.99,
    originalPrice: 99.99,
    category: "Home",
    subcategory: "Kitchen",
    images: [{
      url: "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      alt: "Instant Pot electric pressure cooker",
      isPrimary: true
    }],
    rating: 4.6,
    reviewCount: 3421,
    stockQuantity: 32,
    description: "7-in-1 multi-functional electric pressure cooker that replaces 7 kitchen appliances.",
    features: ["7-in-1 Functionality", "Smart Programming", "Stainless Steel", "Safety Features"],
    brand: "Instant Pot",
    seller: "SenseEase",
    specifications: [
      { name: "Capacity", value: "6 Quart" },
      { name: "Functions", value: "Pressure Cook, Slow Cook, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer" },
      { name: "Material", value: "Stainless Steel" },
      { name: "Warranty", value: "1 Year" }
    ],
    tags: ["kitchen", "cooking", "pressure cooker", "appliance"],
    isFeatured: true
  },
  {
    name: "Tide Laundry Detergent Pods, 81 Count",
    price: 18.97,
    originalPrice: 21.99,
    category: "Household Essentials",
    subcategory: "Laundry",
    images: [{
      url: "https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      alt: "Tide laundry detergent pods",
      isPrimary: true
    }],
    rating: 4.4,
    reviewCount: 1876,
    stockQuantity: 120,
    description: "Powerful 3-in-1 laundry detergent pods with stain removal, brightening, and fresh scent.",
    features: ["3-in-1 Formula", "Stain Removal", "Color Protection", "Fresh Scent"],
    brand: "Tide",
    seller: "SenseEase",
    specifications: [
      { name: "Count", value: "81 Pods" },
      { name: "Formula", value: "3-in-1 (Detergent + Stain Remover + Brightener)" },
      { name: "Scent", value: "Original" },
      { name: "Suitable For", value: "All washing machines" }
    ],
    tags: ["laundry", "detergent", "cleaning", "household"],
    isFeatured: false
  }
]

// Admin user data
const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: process.env.ADMIN_EMAIL || "admin@senseease.com",
  password: process.env.ADMIN_PASSWORD || "admin123456",
  role: "admin",
  isEmailVerified: true,
  isOnboarded: true
}

// Demo user data
const demoUser = {
  firstName: "Demo",
  lastName: "User",
  email: "demo@senseease.com",
  password: "demo123",
  role: "user",
  isEmailVerified: true,
  isOnboarded: true,
  accessibilityPreferences: {
    fontSize: "large",
    highContrast: true,
    focusMode: true,
    adhdSupport: true
  }
}

// Seed function
const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...')

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    logger.info('🗑️ Cleared existing data')

    // Create admin user
    const admin = await User.create(adminUser)
    logger.info(`👑 Created admin user: ${admin.email}`)

    // Create demo user
    const demo = await User.create(demoUser)
    logger.info(`👤 Created demo user: ${demo.email}`)

    // Create products
    const products = await Product.create(sampleProducts)
    logger.info(`📦 Created ${products.length} products`)

    // Update product creation metadata
    for (const product of products) {
      product.createdBy = admin._id
      product.updatedBy = admin._id
      await product.save()
    }

    logger.success('🎉 Database seeding completed successfully!')
    logger.info(`
📊 Seeding Summary:
- Users created: 2 (1 admin, 1 demo)
- Products created: ${products.length}
- Admin email: ${admin.email}
- Demo email: ${demo.email}
    `)

  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`)
    throw error
  }
}

// Run seeding
const runSeeding = async () => {
  try {
    await connectDB()
    await seedDatabase()
    logger.info('✅ Seeding completed, disconnecting...')
    process.exit(0)
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`)
    process.exit(1)
  }
}

// Run if this file is executed directly
runSeeding()

export { seedDatabase }
