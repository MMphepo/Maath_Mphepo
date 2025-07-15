// Rate limiting utilities for API requests

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const now = Date.now()
    const entry = this.store.get(key)

    // If no entry exists or window has expired, create new entry
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false
      }
      this.store.set(key, newEntry)

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    // Check if already blocked
    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Record a request (for post-processing rate limiting)
   */
  recordRequest(key: string, config: RateLimitConfig, success: boolean = true) {
    if (config.skipSuccessfulRequests && success) return
    if (config.skipFailedRequests && !success) return

    this.isAllowed(key, config)
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string) {
    this.store.delete(key)
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy the rate limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  API_GENERAL: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  API_UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 uploads per hour
  API_AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 auth attempts per 15 minutes
  
  // User actions
  BLOG_LIKE: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 likes per minute
  BLOG_COMMENT: { windowMs: 5 * 60 * 1000, maxRequests: 5 }, // 5 comments per 5 minutes
  CONTACT_FORM: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 contact forms per hour
  
  // Admin actions
  ADMIN_CREATE: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 creates per minute
  ADMIN_UPDATE: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 updates per minute
  ADMIN_DELETE: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 deletes per minute
}

/**
 * Generate rate limit key from request info
 */
export const generateRateLimitKey = (
  identifier: string, 
  action: string, 
  resource?: string
): string => {
  const parts = [identifier, action]
  if (resource) parts.push(resource)
  return parts.join(':')
}

/**
 * Get client identifier from request
 */
export const getClientIdentifier = (request: Request): string => {
  // Try to get IP from various headers (for proxy/CDN scenarios)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For authenticated requests, you might want to use user ID instead
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    // Extract user ID from JWT token if needed
    // This is a simplified example
    try {
      const token = authHeader.replace('Bearer ', '')
      // You would decode the JWT here to get user ID
      // For now, we'll use the token itself as identifier
      return `user:${token.substring(0, 10)}`
    } catch {
      // Fall back to IP if token is invalid
    }
  }
  
  return `ip:${ip}`
}

/**
 * Middleware function for rate limiting
 */
export const rateLimit = (config: RateLimitConfig, action: string = 'general') => {
  return (request: Request): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
    headers: Record<string, string>
  } => {
    const identifier = getClientIdentifier(request)
    const key = generateRateLimitKey(identifier, action)
    
    const result = rateLimiter.isAllowed(key, config)
    
    // Generate headers for client
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    }
    
    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString()
    }
    
    return {
      ...result,
      headers
    }
  }
}

/**
 * Check rate limit for a specific action
 */
export const checkRateLimit = (
  identifier: string, 
  action: keyof typeof RATE_LIMITS,
  resource?: string
) => {
  const config = RATE_LIMITS[action]
  const key = generateRateLimitKey(identifier, action, resource)
  return rateLimiter.isAllowed(key, config)
}

/**
 * Record a request for rate limiting
 */
export const recordRequest = (
  identifier: string,
  action: keyof typeof RATE_LIMITS,
  success: boolean = true,
  resource?: string
) => {
  const config = RATE_LIMITS[action]
  const key = generateRateLimitKey(identifier, action, resource)
  rateLimiter.recordRequest(key, config, success)
}

/**
 * Reset rate limit for a specific key
 */
export const resetRateLimit = (
  identifier: string,
  action: keyof typeof RATE_LIMITS,
  resource?: string
) => {
  const key = generateRateLimitKey(identifier, action, resource)
  rateLimiter.reset(key)
}

// Export the rate limiter instance for advanced usage
export { rateLimiter }

// Utility function to create rate limit response
export const createRateLimitResponse = (
  message: string = 'Too many requests',
  retryAfter?: number
) => {
  const response = new Response(
    JSON.stringify({
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
  
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString())
  }
  
  return response
}
