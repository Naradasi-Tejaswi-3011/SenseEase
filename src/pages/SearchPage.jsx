import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useStressDetection } from '../contexts/StressDetectionContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { searchProducts } from '../data/products'
import ProductCard from '../components/ProductCard'
import { Search, Filter, Grid3X3, List, Package, X } from 'lucide-react'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const { preferences } = useUserProfile()
  const { trackInteraction } = useStressDetection()
  const { announceToScreenReader } = useAccessibility()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true)
      try {
        if (query.trim()) {
          const results = searchProducts(query)
          setProducts(results)
          
          trackInteraction('search_performed', { 
            query, 
            resultCount: results.length 
          })
          
          announceToScreenReader(`Found ${results.length} products for "${query}"`)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Search error:', error)
        announceToScreenReader('Error performing search')
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, trackInteraction, announceToScreenReader])

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    
    let sortedProducts = [...products]
    switch (newSortBy) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // Keep original relevance order
        break
    }
    
    setProducts(sortedProducts)
    trackInteraction('search_sort_changed', { sortBy: newSortBy, query })
    announceToScreenReader(`Results sorted by ${newSortBy}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Search Results</span>
          </div>
        </nav>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600">
              Showing results for <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {!query ? (
          /* No Query State */
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-600 mb-6">
              Enter a product name, brand, or category to find what you're looking for
            </p>
            <Link
              to="/"
              className="btn-primary px-6 py-3 rounded-lg inline-flex items-center space-x-2"
            >
              <span>Browse Products</span>
            </Link>
          </div>
        ) : products.length === 0 ? (
          /* No Results State */
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching "{query}". Try different keywords or browse our categories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn-primary px-6 py-3 rounded-lg"
              >
                Browse All Products
              </Link>
              <Link
                to="/grocery"
                className="btn-secondary px-6 py-3 rounded-lg"
              >
                Shop Grocery
              </Link>
            </div>
          </div>
        ) : (
          /* Results */
          <>
            {/* Controls Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Results Count */}
                <div className="text-gray-600">
                  {products.length} {products.length === 1 ? 'result' : 'results'} found
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
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  showDiscount={true}
                />
              ))}
            </div>

            {/* Search Tips */}
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Search Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Try different keywords:</h4>
                  <ul className="space-y-1">
                    <li>• Use specific product names</li>
                    <li>• Include brand names</li>
                    <li>• Try category names</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Popular searches:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['iPhone', 'Coffee', 'Laptop', 'Jeans', 'TV'].map((term) => (
                      <Link
                        key={term}
                        to={`/search?q=${term}`}
                        className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-100 transition-colors"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
