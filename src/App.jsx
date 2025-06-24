import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { UserProfileProvider } from './contexts/UserProfileContext'
import { StressDetectionProvider } from './contexts/StressDetectionContext'
import { CartProvider } from './contexts/CartContext'
import { ProductProvider } from './contexts/ProductContext'
import { ToastProvider } from './contexts/ToastContext'
import Header from './components/Header'
import AccessibilityToolbar from './components/AccessibilityToolbar'
import StressDetectionModal from './components/StressDetectionModal'
import AdaptiveUIManager from './components/adaptive/AdaptiveUIManager'
import PerformanceMonitor from './components/PerformanceMonitor'
import ProtectedRoute from './components/ProtectedRoute'
import stressDetection from './utils/stressDetection'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'
import TestPage from './pages/TestPage'

function App() {
  // Initialize stress detection system
  useEffect(() => {
    // The stress detection system is automatically initialized when imported
    console.log('SenseEase app initialized with stress detection')
  }, [])

  return (
    <AuthProvider>
      <UserProfileProvider>
        <AccessibilityProvider>
          <StressDetectionProvider>
            <ProductProvider>
              <CartProvider>
                <ToastProvider>
                <Router>
                <div className="min-h-screen bg-white">
                  <Header />
                  <AccessibilityToolbar />
                  <StressDetectionModal />
                  <AdaptiveUIManager />
                  <main className="pt-16" id="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />

                      {/* Category Routes */}
                      <Route path="/grocery" element={<CategoryPage />} />
                      <Route path="/electronics" element={<CategoryPage />} />
                      <Route path="/home" element={<CategoryPage />} />
                      <Route path="/clothing" element={<CategoryPage />} />
                      <Route path="/category/:category" element={<CategoryPage />} />
                      <Route path="/test" element={<TestPage />} />

                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <PerformanceMonitor />
                </div>
                </Router>
                </ToastProvider>
              </CartProvider>
            </ProductProvider>
          </StressDetectionProvider>
        </AccessibilityProvider>
      </UserProfileProvider>
    </AuthProvider>
  )
}

export default App
