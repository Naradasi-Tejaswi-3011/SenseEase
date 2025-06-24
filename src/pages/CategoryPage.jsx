import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { getProductsByCategory, getAllProducts } from '../data/products'
import ProductCard from '../components/ProductCard'
import { 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ArrowUpDown,
  Star,
  DollarSign,
  Package,
  ChevronDown,
  X
} from 'lucide-react'

const CategoryPage = () => {
  const { category: paramCategory } = useParams()
  const navigate = useNavigate()

  // Get category from URL path or param
  const category = paramCategory || window.location.pathname.slice(1)
  const { preferences } = useUserProfile()
  const { trackInteraction } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [],
    rating: 0,
    inStock: false
  })

  // Category configurations
  const categoryConfig = {
    grocery: {
      title: 'Grocery & Food',
      description: 'Fresh groceries, pantry essentials, and organic options',
      icon: '🛒',
      subcategories: ['Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry', 'Beverages', 'Snacks']
    },
    electronics: {
      title: 'Electronics',
      description: 'Latest technology, gadgets, and electronic devices',
      icon: '📱',
      subcategories: ['Smartphones', 'Laptops', 'Audio', 'Gaming', 'Smart Home', 'Accessories']
    },
    home: {
      title: 'Home & Garden',
      description: 'Everything for your home, garden, and living spaces',
      icon: '🏠',
      subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Garden', 'Storage']
    },
    clothing: {
      title: 'Clothing & Fashion',
      description: 'Stylish clothing, shoes, and accessories for everyone',
      icon: '👕',
      subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing', 'Shoes', 'Accessories', 'Activewear']
    }
  }

  const currentCategory = categoryConfig[category] || {
    title: 'Products',
    description: 'Browse our selection of products',
    icon: '📦',
    subcategories: []
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        let categoryProducts
        if (category && categoryConfig[category]) {
          categoryProducts = getProductsByCategory(category)
        } else {
          categoryProducts = getAllProducts()
        }
        
        setProducts(categoryProducts)
        setFilteredProducts(categoryProducts)
        
        trackInteraction('category_page_view', { 
          category: category || 'all',
          productCount: categoryProducts.length 
        })
        
        announceToScreenReader(`Loaded ${categoryProducts.length} products in ${currentCategory.title}`)
      } catch (error) {
        console.error('Error loading products:', error)
        announceToScreenReader('Error loading products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [category, trackInteraction, announceToScreenReader, currentCategory.title])

  useEffect(() => {
    applyFiltersAndSort()
  }, [products, filters, sortBy])

  const applyFiltersAndSort = () => {
    let filtered = [...products]

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    )

    // Apply brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      )
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating)
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // Keep original order for 'featured'
        break
    }

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    trackInteraction('filter_applied', { filterType, value, category })
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      rating: 0,
      inStock: false
    })
    announceToScreenReader('All filters cleared')
  }

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    trackInteraction('sort_changed', { sortBy: newSortBy, category })
    announceToScreenReader(`Products sorted by ${newSortBy}`)
  }

  const availableBrands = [...new Set(products.map(product => product.brand))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 page-transition">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{currentCategory.title}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">{currentCategory.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentCategory.title}</h1>
              <p className="text-gray-600">{currentCategory.description}</p>
            </div>
          </div>

          {/* Subcategories */}
          {currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium"
                  onClick={() => {
                    trackInteraction('subcategory_click', { subcategory, category })
                    // In a real app, this would filter by subcategory
                  }}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Results Count */}
            <div className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="name">Name A-Z</option>
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$0</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                {availableBrands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={(e) => {
                              const newBrands = e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter(b => b !== brand)
                              handleFilterChange('brands', newBrands)
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => handleFilterChange('rating', rating)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary px-6 py-3 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    showDiscount={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
