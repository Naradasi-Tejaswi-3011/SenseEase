import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ShoppingProvider } from './contexts/ShoppingContext'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import AccessibilityPage from './pages/AccessibilityPage'
import ProtectedRoute from './components/ProtectedRoute'
import useStressDetection from './hooks/useStressDetection'
import AuthDebug from './components/AuthDebug'

function AppContent() {
  // Initialize stress detection
  useStressDetection()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16" id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
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
      <AuthDebug />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <ShoppingProvider>
          <Router>
            <AppContent />
          </Router>
        </ShoppingProvider>
      </AccessibilityProvider>
    </AuthProvider>
  )
}

export default App
