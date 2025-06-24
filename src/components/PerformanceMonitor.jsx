import React, { useEffect, useState } from 'react'

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: Math.round(entry.loadEventEnd - entry.loadEventStart)
          }))
        }
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: Math.round(entry.duration)
          }))
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'measure'] })

    // Monitor memory usage if available
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }))
      }
      
      updateMemory()
      const interval = setInterval(updateMemory, 5000)
      
      return () => {
        clearInterval(interval)
        observer.disconnect()
      }
    }

    return () => observer.disconnect()
  }, [])

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div>Load: {metrics.loadTime}ms</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
    </div>
  )
}

export default PerformanceMonitor
