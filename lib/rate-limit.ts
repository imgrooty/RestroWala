/**
 * Rate Limiting Utility
 * 
 * Protects sensitive endpoints from brute force attacks
 * Uses Redis for distributed rate limiting
 */

import { redisClient } from './redis';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
  
  /**
   * Optional custom identifier (defaults to IP address)
   */
  identifier?: string;
}

/**
 * Check if request should be rate limited
 * Returns true if rate limit is exceeded
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
  try {
    // Ensure Redis is connected (connection is managed by the redis client singleton)
    if (!redisClient.isOpen) {
      try {
        await redisClient.connect();
      } catch (connectError) {
        console.error('Redis connection failed:', connectError);
        // Fail closed - return rate limited to be safe
        return {
          limited: true,
          remaining: 0,
          resetIn: config.windowSeconds,
        };
      }
    }

    const key = `rate_limit:${identifier}`;
    const currentCount = await redisClient.get(key);
    
    if (currentCount === null) {
      // First request in window
      await redisClient.setEx(key, config.windowSeconds, '1');
      return {
        limited: false,
        remaining: config.maxRequests - 1,
        resetIn: config.windowSeconds,
      };
    }
    
    const count = parseInt(currentCount, 10);
    
    if (count >= config.maxRequests) {
      // Rate limit exceeded
      const ttl = await redisClient.ttl(key);
      return {
        limited: true,
        remaining: 0,
        resetIn: ttl > 0 ? ttl : config.windowSeconds,
      };
    }
    
    // Increment counter
    await redisClient.incr(key);
    const ttl = await redisClient.ttl(key);
    
    return {
      limited: false,
      remaining: config.maxRequests - count - 1,
      resetIn: ttl > 0 ? ttl : config.windowSeconds,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // FAIL CLOSED: Block requests by default when rate limiting fails
    // This is a security-first approach - better to temporarily block legitimate
    // traffic than to allow potential abuse during Redis outages
    console.error(`SECURITY: Rate limiting failed for ${identifier}. Blocking request as a precaution.`);
    return {
      limited: true,
      remaining: 0,
      resetIn: config.windowSeconds,
    };
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Check for forwarded IP (from proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  LOGIN: { maxRequests: 5, windowSeconds: 300 }, // 5 attempts per 5 minutes
  FORGOT_PASSWORD: { maxRequests: 3, windowSeconds: 3600 }, // 3 attempts per hour
  RESET_PASSWORD: { maxRequests: 3, windowSeconds: 3600 }, // 3 attempts per hour
  REGISTER: { maxRequests: 3, windowSeconds: 3600 }, // 3 attempts per hour
  
  // API endpoints - moderate limits
  API_WRITE: { maxRequests: 30, windowSeconds: 60 }, // 30 requests per minute
  API_READ: { maxRequests: 100, windowSeconds: 60 }, // 100 requests per minute
  
  // File upload - strict limits
  UPLOAD: { maxRequests: 10, windowSeconds: 300 }, // 10 uploads per 5 minutes
};
