// Simple in-memory rate limiter
// Note: Resets on deployment/cold starts. Good for MVP, consider Upstash Redis for production.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const ipLimits = new Map<string, RateLimitEntry>()
const projectLimits = new Map<string, RateLimitEntry>()

function cleanupExpired(map: Map<string, RateLimitEntry>) {
  const now = Date.now()
  for (const [key, entry] of map.entries()) {
    if (now > entry.resetAt) {
      map.delete(key)
    }
  }
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  type: 'ip' | 'project' = 'ip'
): { allowed: boolean; remaining: number; resetAt: number } {
  const map = type === 'ip' ? ipLimits : projectLimits
  const now = Date.now()
  
  // Cleanup expired entries occasionally (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupExpired(map)
  }
  
  const entry = map.get(identifier)
  
  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowMs
    map.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }
  
  if (entry.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }
  
  // Increment counter
  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getClientIP(request: Request): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to a placeholder (shouldn't happen on Vercel)
  return 'unknown'
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Public API endpoints (schema, schema-html)
  PUBLIC_PER_MINUTE: { limit: 100, window: 60 * 1000 }, // 100 req/min
  PUBLIC_PER_HOUR: { limit: 1000, window: 60 * 60 * 1000 }, // 1000 req/hour
  
  // Per-project limits
  PROJECT_PER_DAY: { limit: 10000, window: 24 * 60 * 60 * 1000 }, // 10k req/day per project
  
  // Webhook limits
  WEBHOOK_PER_MINUTE: { limit: 50, window: 60 * 1000 }, // 50 req/min
} as const
