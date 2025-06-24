import React from 'react'
import { categories } from '../data/products'
import { useStressDetection } from '../contexts/StressDetectionContext'
import {
  ShoppingCart,
  Smartphone,
  Home,
  Shirt,
  Droplets,
  Dumbbell
} from 'lucide-react'

const CategoryGrid = () => {
  const { trackInteraction } = useStressDetection()

  const categoryIcons = {
    grocery: ShoppingCart,
    electronics: Smartphone,
    home: Home,
    clothing: Shirt,
    household: Droplets,
    sports: Dumbbell
  }

  const categoryColors = {
    grocery: 'green',
    electronics: 'blue',
    home: 'purple',
    clothing: 'pink',
    household: 'yellow',
    sports: 'orange'
  }

  const handleCategoryClick = (category) => {
    trackInteraction('category_click', { categoryId: category.id, categoryName: category.name })
    // Navigate to category page (to be implemented)
    console.log('Navigate to category:', category.name)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => {
        const IconComponent = categoryIcons[category.id] || ShoppingCart
        const color = categoryColors[category.id] || 'blue'

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className={`w-16 h-16 mx-auto mb-4 bg-${color}-100 rounded-2xl flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
              <IconComponent className={`w-8 h-8 text-${color}-600`} />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {category.subcategories.length} subcategories
            </p>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryGrid
