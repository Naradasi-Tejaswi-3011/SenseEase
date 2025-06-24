import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const AuthDebug = () => {
  const { isAuthenticated, user, loading, error, initialized } = useAuth()

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Initialized: {initialized ? '✅' : '⏳'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {loading ? '⏳' : '✅'}</div>
        <div>Error: {error || 'None'}</div>
        <div>User: {user ? `${user.firstName} ${user.lastName}` : 'None'}</div>
        <div>Token: {localStorage.getItem('senseease-token') ? '✅' : '❌'}</div>
        <div>User Data: {localStorage.getItem('senseease-user') ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}

export default AuthDebug
