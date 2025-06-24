class StressDetectionSystem {
  constructor() {
    this.events = []
    this.thresholds = {
      rapidNavigation: { count: 5, timeWindow: 10000 }, // 5 clicks in 10 seconds
      longPauses: { duration: 30000 }, // 30 seconds of inactivity
      failedSubmissions: { count: 3, timeWindow: 60000 }, // 3 failures in 1 minute
      erraticScrolling: { count: 10, timeWindow: 5000 }, // 10 scroll events in 5 seconds
      repeatedClicks: { count: 3, timeWindow: 1000 }, // 3 clicks on same element in 1 second
      backButtonUsage: { count: 3, timeWindow: 30000 }, // 3 back button uses in 30 seconds
      formAbandonment: { count: 2, timeWindow: 300000 }, // 2 form abandonments in 5 minutes
      searchFrustration: { count: 5, timeWindow: 60000 } // 5 searches with no clicks in 1 minute
    }
    
    this.lastActivity = Date.now()
    this.inactivityTimer = null
    this.analytics = null
    
    this.init()
  }

  init() {
    // Set up event listeners
    this.setupEventListeners()

    // Start monitoring
    this.startMonitoring()
  }

  setupEventListeners() {
    // Track clicks
    document.addEventListener('click', (e) => {
      this.trackEvent('click', {
        element: this.getElementSelector(e.target),
        timestamp: Date.now(),
        coordinates: { x: e.clientX, y: e.clientY }
      })
      this.updateActivity()
    })

    // Track scrolling
    let scrollTimeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.trackEvent('scroll', {
          scrollY: window.scrollY,
          timestamp: Date.now()
        })
      }, 100)
      this.updateActivity()
    })

    // Track form interactions
    document.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.trackEvent('form_focus', {
          element: this.getElementSelector(e.target),
          timestamp: Date.now()
        })
      }
      this.updateActivity()
    })

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackEvent('form_submit', {
        element: this.getElementSelector(e.target),
        timestamp: Date.now()
      })
      this.updateActivity()
    })

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackEvent('back_button', {
        timestamp: Date.now(),
        url: window.location.href
      })
      this.updateActivity()
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { timestamp: Date.now() })
      } else {
        this.trackEvent('page_visible', { timestamp: Date.now() })
        this.updateActivity()
      }
    })

    // Track keyboard events
    document.addEventListener('keydown', (e) => {
      // Track escape key (potential frustration indicator)
      if (e.key === 'Escape') {
        this.trackEvent('escape_key', { timestamp: Date.now() })
      }
      this.updateActivity()
    })
  }

  trackEvent(type, data) {
    const event = { type, data, timestamp: Date.now() }
    this.events.push(event)
    
    // Keep only recent events (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 300000
    this.events = this.events.filter(e => e.timestamp > fiveMinutesAgo)
    
    // Analyze for stress patterns
    this.analyzeStressPatterns(type, data)
  }

  analyzeStressPatterns(eventType, eventData) {
    const now = Date.now()
    
    // Rapid Navigation Detection
    if (eventType === 'click') {
      const recentClicks = this.events.filter(e => 
        e.type === 'click' && 
        now - e.timestamp < this.thresholds.rapidNavigation.timeWindow
      )
      
      if (recentClicks.length >= this.thresholds.rapidNavigation.count) {
        this.triggerStressEvent('rapid_navigation', 'medium', {
          clickCount: recentClicks.length,
          timeWindow: this.thresholds.rapidNavigation.timeWindow
        })
      }
    }

    // Repeated Clicks Detection
    if (eventType === 'click') {
      const sameElementClicks = this.events.filter(e => 
        e.type === 'click' && 
        e.data.element === eventData.element &&
        now - e.timestamp < this.thresholds.repeatedClicks.timeWindow
      )
      
      if (sameElementClicks.length >= this.thresholds.repeatedClicks.count) {
        this.triggerStressEvent('repeated_clicks', 'high', {
          element: eventData.element,
          clickCount: sameElementClicks.length
        })
      }
    }

    // Erratic Scrolling Detection
    if (eventType === 'scroll') {
      const recentScrolls = this.events.filter(e => 
        e.type === 'scroll' && 
        now - e.timestamp < this.thresholds.erraticScrolling.timeWindow
      )
      
      if (recentScrolls.length >= this.thresholds.erraticScrolling.count) {
        this.triggerStressEvent('erratic_scrolling', 'medium', {
          scrollCount: recentScrolls.length
        })
      }
    }

    // Back Button Usage Detection
    if (eventType === 'back_button') {
      const recentBackButtons = this.events.filter(e => 
        e.type === 'back_button' && 
        now - e.timestamp < this.thresholds.backButtonUsage.timeWindow
      )
      
      if (recentBackButtons.length >= this.thresholds.backButtonUsage.count) {
        this.triggerStressEvent('back_button_usage', 'medium', {
          backButtonCount: recentBackButtons.length
        })
      }
    }

    // Form Abandonment Detection
    if (eventType === 'form_focus') {
      // Check if user focused on form but didn't submit
      setTimeout(() => {
        const formSubmits = this.events.filter(e => 
          e.type === 'form_submit' && 
          e.timestamp > eventData.timestamp
        )
        
        if (formSubmits.length === 0) {
          this.triggerStressEvent('form_abandonment', 'low', {
            element: eventData.element,
            focusTime: eventData.timestamp
          })
        }
      }, 30000) // Check after 30 seconds
    }
  }

  triggerStressEvent(type, severity, context) {
    console.log(`Stress event detected: ${type} (${severity})`, context)

    // Trigger adaptive UI response
    this.triggerAdaptiveResponse(type, severity, context)

    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('stressDetected', {
      detail: { type, severity, context }
    }))
  }

  triggerAdaptiveResponse(type, severity, context) {
    // Suggest focus mode for high stress
    if (severity === 'high') {
      this.suggestFocusMode(type)
    }
    
    // Show calming message for repeated failures
    if (type === 'repeated_clicks' || type === 'form_abandonment') {
      this.showCalmingMessage()
    }
    
    // Simplify interface for navigation issues
    if (type === 'rapid_navigation' || type === 'back_button_usage') {
      this.suggestSimplifiedNavigation()
    }
  }

  suggestFocusMode(triggerType) {
    // Dispatch event to show focus mode suggestion
    window.dispatchEvent(new CustomEvent('suggestFocusMode', {
      detail: { triggerType }
    }))
  }

  showCalmingMessage() {
    // Dispatch event to show calming message
    window.dispatchEvent(new CustomEvent('showCalmingMessage'))
  }

  suggestSimplifiedNavigation() {
    // Dispatch event to suggest simplified navigation
    window.dispatchEvent(new CustomEvent('suggestSimplifiedNavigation'))
  }

  updateActivity() {
    this.lastActivity = Date.now()
    
    // Clear existing inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }
    
    // Set new inactivity timer
    this.inactivityTimer = setTimeout(() => {
      this.triggerStressEvent('long_pauses', 'low', {
        inactivityDuration: this.thresholds.longPauses.duration
      })
    }, this.thresholds.longPauses.duration)
  }

  startMonitoring() {
    // Initial activity update
    this.updateActivity()
    
    console.log('Stress detection system initialized')
  }

  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`
    }
    
    if (element.className) {
      return `.${element.className.split(' ')[0]}`
    }
    
    return element.tagName.toLowerCase()
  }

  // Method to manually report failed submissions
  reportFailedSubmission(formElement, errorType) {
    this.trackEvent('failed_submission', {
      element: this.getElementSelector(formElement),
      errorType,
      timestamp: Date.now()
    })
    
    // Check for pattern of failed submissions
    const now = Date.now()
    const recentFailures = this.events.filter(e => 
      e.type === 'failed_submission' && 
      now - e.timestamp < this.thresholds.failedSubmissions.timeWindow
    )
    
    if (recentFailures.length >= this.thresholds.failedSubmissions.count) {
      this.triggerStressEvent('failed_submissions', 'high', {
        failureCount: recentFailures.length,
        lastError: errorType
      })
    }
  }

  // Method to manually report search frustration
  reportSearchFrustration(query, resultsCount) {
    this.trackEvent('search_query', {
      query,
      resultsCount,
      timestamp: Date.now()
    })
    
    // Check for pattern of searches with no clicks
    const now = Date.now()
    const recentSearches = this.events.filter(e => 
      e.type === 'search_query' && 
      now - e.timestamp < this.thresholds.searchFrustration.timeWindow
    )
    
    if (recentSearches.length >= this.thresholds.searchFrustration.count) {
      const searchesWithNoResults = recentSearches.filter(s => s.data.resultsCount === 0)
      
      if (searchesWithNoResults.length >= 3) {
        this.triggerStressEvent('search_frustration', 'medium', {
          searchCount: recentSearches.length,
          noResultsCount: searchesWithNoResults.length
        })
      }
    }
  }

  // Method to get current stress level
  getCurrentStressLevel() {
    const now = Date.now()
    const recentEvents = this.events.filter(e => now - e.timestamp < 60000) // Last minute
    
    const stressEvents = recentEvents.filter(e => 
      ['rapid_navigation', 'repeated_clicks', 'failed_submission', 'erratic_scrolling'].includes(e.type)
    )
    
    if (stressEvents.length >= 5) return 'high'
    if (stressEvents.length >= 2) return 'medium'
    return 'low'
  }
}

// Create singleton instance
const stressDetection = new StressDetectionSystem()

export default stressDetection
