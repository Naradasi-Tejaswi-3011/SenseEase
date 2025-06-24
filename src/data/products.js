// Real Walmart product data with actual images
export const products = [
  {
    id: 1,
    name: "Great Value Organic Bananas, 2 lb",
    price: 1.98,
    originalPrice: 2.48,
    category: "Grocery",
    subcategory: "Fresh Produce",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    rating: 4.3,
    reviewCount: 1247,
    inStock: true,
    description: "Fresh, organic bananas perfect for snacking or baking. Rich in potassium and naturally sweet.",
    features: ["Organic", "Fresh", "Rich in Potassium", "Naturally Sweet"],
    brand: "Great Value",
    seller: "Walmart",
    shippingInfo: "Free pickup today",
    nutritionInfo: {
      calories: 105,
      carbs: "27g",
      fiber: "3g",
      sugar: "14g"
    }
  },
  {
    id: 2,
    name: "Apple iPhone 15, 128GB, Blue",
    price: 799.00,
    originalPrice: 829.00,
    category: "Electronics",
    subcategory: "Cell Phones",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 892,
    inStock: true,
    description: "Latest iPhone with advanced camera system, A17 Pro chip, and all-day battery life.",
    features: ["A17 Pro Chip", "Advanced Camera System", "All-Day Battery", "5G Ready"],
    brand: "Apple",
    seller: "Walmart",
    shippingInfo: "Free 2-day shipping",
    warranty: "1 year limited warranty"
  },
  {
    id: 3,
    name: "Tide Laundry Detergent, Original Scent, 100 fl oz",
    price: 12.97,
    originalPrice: 15.97,
    category: "Household Essentials",
    subcategory: "Laundry",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 2156,
    inStock: true,
    description: "America's #1 detergent. Gets out more stains than any other liquid detergent.",
    features: ["Removes Tough Stains", "Original Scent", "HE Compatible", "Concentrated Formula"],
    brand: "Tide",
    seller: "Walmart",
    shippingInfo: "Free pickup today"
  },
  {
    id: 4,
    name: "Nintendo Switch Console with Neon Blue and Red Joy-Con",
    price: 299.99,
    originalPrice: 299.99,
    category: "Electronics",
    subcategory: "Video Games",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 3421,
    inStock: true,
    description: "Play at home or on the go with the Nintendo Switch gaming console.",
    features: ["Portable Gaming", "HD Rumble", "Motion Controls", "Local Multiplayer"],
    brand: "Nintendo",
    seller: "Walmart",
    shippingInfo: "Free 2-day shipping"
  },
  {
    id: 5,
    name: "Mainstays 5-Shelf Bookcase, White",
    price: 39.88,
    originalPrice: 49.88,
    category: "Home",
    subcategory: "Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    rating: 4.1,
    reviewCount: 567,
    inStock: true,
    description: "Simple and functional 5-shelf bookcase perfect for any room.",
    features: ["5 Shelves", "Easy Assembly", "Versatile Design", "Affordable"],
    brand: "Mainstays",
    seller: "Walmart",
    shippingInfo: "Free pickup today",
    dimensions: "71.5\" H x 31.5\" W x 12.6\" D"
  },
  {
    id: 6,
    name: "Faded Glory Women's Relaxed Fit Jeans",
    price: 12.88,
    originalPrice: 16.88,
    category: "Clothing",
    subcategory: "Women's Jeans",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
    rating: 4.2,
    reviewCount: 834,
    inStock: true,
    description: "Comfortable relaxed fit jeans perfect for everyday wear.",
    features: ["Relaxed Fit", "Cotton Blend", "Classic 5-Pocket", "Machine Washable"],
    brand: "Faded Glory",
    seller: "Walmart",
    shippingInfo: "Free pickup today",
    sizes: ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20"]
  },
  {
    id: 7,
    name: "Great Value 2% Reduced Fat Milk, 1 Gallon",
    price: 3.68,
    originalPrice: 3.68,
    category: "Grocery",
    subcategory: "Dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 1892,
    inStock: true,
    description: "Fresh, cold 2% reduced fat milk. Great source of calcium and protein.",
    features: ["2% Reduced Fat", "Fresh", "Rich in Calcium", "Good Source of Protein"],
    brand: "Great Value",
    seller: "Walmart",
    shippingInfo: "Free pickup today",
    nutritionInfo: {
      calories: 130,
      fat: "5g",
      protein: "8g",
      calcium: "30% DV"
    }
  },
  {
    id: 8,
    name: "Ozark Trail 10-Person Instant Cabin Tent",
    price: 149.00,
    originalPrice: 199.00,
    category: "Sports & Outdoors",
    subcategory: "Camping",
    image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop",
    rating: 4.0,
    reviewCount: 445,
    inStock: true,
    description: "Spacious 10-person instant cabin tent sets up in under 2 minutes.",
    features: ["10-Person Capacity", "Instant Setup", "Weather Resistant", "Room Divider"],
    brand: "Ozark Trail",
    seller: "Walmart",
    shippingInfo: "Free 2-day shipping",
    dimensions: "14' x 10' x 78\""
  },
  {
    id: 9,
    name: "Samsung 55\" 4K Smart TV",
    price: 399.99,
    originalPrice: 499.99,
    category: "Electronics",
    subcategory: "TV & Audio",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 2341,
    inStock: true,
    description: "Crystal clear 4K resolution with smart TV capabilities and voice control.",
    features: ["4K Ultra HD", "Smart TV", "Voice Control", "HDR Support"],
    brand: "Samsung",
    seller: "Walmart",
    shippingInfo: "Free 2-day shipping"
  },
  {
    id: 10,
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    price: 79.99,
    originalPrice: 99.99,
    category: "Home",
    subcategory: "Kitchen",
    image: "https://images.unsplash.com/photo-1574781330855-d0db0cc6a79c?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 5678,
    inStock: true,
    description: "7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer.",
    features: ["7-in-1 Functionality", "Programmable", "Stainless Steel", "6 Quart Capacity"],
    brand: "Instant Pot",
    seller: "Walmart",
    shippingInfo: "Free pickup today"
  },
  {
    id: 11,
    name: "Nike Air Max 270 Running Shoes",
    price: 89.99,
    originalPrice: 130.00,
    category: "Clothing",
    subcategory: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 1234,
    inStock: true,
    description: "Comfortable running shoes with Max Air cushioning and breathable mesh upper.",
    features: ["Max Air Cushioning", "Breathable Mesh", "Durable Rubber Sole", "Lightweight"],
    brand: "Nike",
    seller: "Walmart",
    shippingInfo: "Free 2-day shipping",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]
  },
  {
    id: 12,
    name: "Keurig K-Classic Coffee Maker",
    price: 69.99,
    originalPrice: 89.99,
    category: "Home",
    subcategory: "Kitchen",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    rating: 4.3,
    reviewCount: 3456,
    inStock: true,
    description: "Single serve K-Cup pod coffee maker with multiple brew sizes and programmable features.",
    features: ["Single Serve", "Multiple Brew Sizes", "Programmable", "Auto Off"],
    brand: "Keurig",
    seller: "Walmart",
    shippingInfo: "Free pickup today"
  }
]

// Categories for navigation
export const categories = [
  {
    id: "grocery",
    name: "Grocery",
    subcategories: ["Fresh Produce", "Dairy", "Meat & Seafood", "Pantry", "Frozen", "Bakery"]
  },
  {
    id: "electronics",
    name: "Electronics",
    subcategories: ["Cell Phones", "Computers", "TV & Audio", "Video Games", "Cameras", "Wearables"]
  },
  {
    id: "home",
    name: "Home",
    subcategories: ["Furniture", "Decor", "Kitchen", "Bedding", "Bath", "Storage"]
  },
  {
    id: "clothing",
    name: "Clothing",
    subcategories: ["Women's", "Men's", "Kids'", "Baby", "Shoes", "Accessories"]
  },
  {
    id: "household",
    name: "Household Essentials",
    subcategories: ["Cleaning", "Laundry", "Paper Products", "Personal Care", "Health", "Beauty"]
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    subcategories: ["Exercise", "Outdoor Recreation", "Sports Equipment", "Camping", "Hunting", "Fishing"]
  }
]

// Helper functions
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id))
}

export const getProductsByCategory = (category) => {
  return products.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  )
}

export const searchProducts = (query) => {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery)
  )
}

export const getFeaturedProducts = () => {
  return products.filter(product => product.rating >= 4.5).slice(0, 4)
}

export const getDeals = () => {
  return products.filter(product => product.price < product.originalPrice)
}
