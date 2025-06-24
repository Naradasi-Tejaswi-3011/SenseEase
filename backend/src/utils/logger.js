// Simple logger utility for development
// In production, consider using winston or similar

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

const getTimestamp = () => {
  return new Date().toISOString()
}

const formatMessage = (level, message, color) => {
  const timestamp = getTimestamp()
  if (process.env.NODE_ENV === 'development') {
    return `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`
  }
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`
}

export const logger = {
  info: (message) => {
    console.log(formatMessage('info', message, colors.blue))
  },
  
  warn: (message) => {
    console.warn(formatMessage('warn', message, colors.yellow))
  },
  
  error: (message) => {
    console.error(formatMessage('error', message, colors.red))
  },
  
  success: (message) => {
    console.log(formatMessage('success', message, colors.green))
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage('debug', message, colors.magenta))
    }
  }
}
