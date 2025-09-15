// Input validation and sanitization utilities

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000) // Limit length
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateTopicTitle = (title: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(title)
  
  if (!sanitized) {
    return { isValid: false, error: 'Title is required' }
  }
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters long' }
  }
  
  if (sanitized.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' }
  }
  
  return { isValid: true }
}

export const validateQuestionPrompt = (prompt: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(prompt)
  
  if (!sanitized) {
    return { isValid: false, error: 'Question prompt is required' }
  }
  
  if (sanitized.length < 10) {
    return { isValid: false, error: 'Question must be at least 10 characters long' }
  }
  
  if (sanitized.length > 5000) {
    return { isValid: false, error: 'Question must be less than 5000 characters' }
  }
  
  return { isValid: true }
}

export const validateKPIName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name)
  
  if (!sanitized) {
    return { isValid: false, error: 'KPI name is required' }
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'KPI name must be at least 2 characters long' }
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: 'KPI name must be less than 100 characters' }
  }
  
  return { isValid: true }
}

export const validateAnswer = (answer: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(answer)
  
  if (!sanitized) {
    return { isValid: false, error: 'Answer is required' }
  }
  
  if (sanitized.length < 10) {
    return { isValid: false, error: 'Answer must be at least 10 characters long' }
  }
  
  if (sanitized.length > 10000) {
    return { isValid: false, error: 'Answer must be less than 10000 characters' }
  }
  
  return { isValid: true }
}

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(private maxAttempts: number, private windowMs: number) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    // Add current attempt
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    
    return true
  }
  
  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || []
    if (attempts.length === 0) return 0
    
    const oldestAttempt = Math.min(...attempts)
    return Math.max(0, this.windowMs - (Date.now() - oldestAttempt))
  }
}

// Security headers and CSP
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
})

// Input sanitization for rich text
export const sanitizeRichText = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}
