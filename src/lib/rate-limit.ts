// Rate limiting utility for API protection
// Based on token bucket algorithm

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.config = config;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now >= entry.resetTime) {
      // New window or expired entry
      const resetTime = now + this.config.interval;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Rate limiters for different user types
export const rateLimiters = {
  // Anonymous users: 1 request per 5 minutes per IP
  anonymous: new RateLimiter({
    interval: 5 * 60 * 1000,
    maxRequests: 1,
  }),

  // Authenticated non-plasma users: 5 requests per hour per wallet
  authenticated: new RateLimiter({
    interval: 60 * 60 * 1000,
    maxRequests: 5,
  }),

  // plasma.to users: 100 requests per hour (effectively unlimited)
  plasma: new RateLimiter({
    interval: 60 * 60 * 1000,
    maxRequests: 100,
  }),

  // Payment verification: 10 attempts per payment per hour
  paymentVerification: new RateLimiter({
    interval: 60 * 60 * 1000,
    maxRequests: 10,
  }),
};

// Cleanup old entries every 10 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach((limiter) => limiter.cleanup());
}, 10 * 60 * 1000);

export function getRateLimitIdentifier(req: Request, type: 'ip' | 'wallet' = 'ip'): string {
  if (type === 'ip') {
    // Get IP from headers (consider proxy headers)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `ip:${ip}`;
  }
  
  // For wallet-based rate limiting, extract from request body or headers
  // This would be implemented based on your auth system
  return 'wallet:unknown';
}
