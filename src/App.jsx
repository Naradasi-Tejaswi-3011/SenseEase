import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { UserProfileProvider } from './contexts/UserProfileContext'
import { StressDetectionProvider } from './contexts/StressDetectionContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header'
import AccessibilityToolbar from './components/AccessibilityToolbar'
import StressDetectionModal from './components/StressDetectionModal'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <AccessibilityProvider>
          <StressDetectionProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen bg-white">
                  <Header />
                  <AccessibilityToolbar />
                  <StressDetectionModal />
                  <main className="pt-16" id="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
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
                    </Routes>
                  </main>
                </div>
              </Router>
            </CartProvider>
          </StressDetectionProvider>
        </AccessibilityProvider>
      </UserProfileProvider>
    </AuthProvider>
  )
}

export default App
