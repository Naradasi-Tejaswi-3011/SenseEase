import React, { useState } from 'react'

const ApiTest = () => {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testApiConnection = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      console.log('Testing API connection to:', API_URL)
      
      // Test basic connectivity
      const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Health check response:', response)
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ API Connection Successful: ${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`❌ API Connection Failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('API Test Error:', error)
      setTestResult(`❌ API Connection Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testRegistration = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890'
      }
      
      console.log('Testing registration with:', testData)
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })
      
      console.log('Registration response:', response)
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Registration Test Successful: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorData = await response.json()
        setTestResult(`❌ Registration Test Failed: ${response.status} ${JSON.stringify(errorData, null, 2)}`)
      }
    } catch (error) {
      console.error('Registration Test Error:', error)
      setTestResult(`❌ Registration Test Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">API Connection Test</h3>
      <div className="space-y-2">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Health Check'}
        </button>
        <button
          onClick={testRegistration}
          disabled={loading}
          className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
      </div>
      {testResult && (
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
          {testResult}
        </pre>
      )}
    </div>
  )
}

export default ApiTest
