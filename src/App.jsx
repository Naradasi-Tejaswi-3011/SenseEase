import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { UserProfileProvider } from './contexts/UserProfileContext'
import { StressDetectionProvider } from './contexts/StressDetectionContext'
import Header from './components/Header'
import AccessibilityToolbar from './components/AccessibilityToolbar'
import StressDetectionModal from './components/StressDetectionModal'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <UserProfileProvider>
      <AccessibilityProvider>
        <StressDetectionProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Header />
              <AccessibilityToolbar />
              <StressDetectionModal />
              <main className="pt-16" id="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </StressDetectionProvider>
      </AccessibilityProvider>
    </UserProfileProvider>
  )
}

export default App
