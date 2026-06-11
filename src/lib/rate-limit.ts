import { Ratelimit } from '@upstash/ratelimit';
import redis from './redis';

// Rate limit configurations
const defaultConfig = { windowMs: 60 * 1000, maxRequests: 30 }; // 30 req/min
const authConfig = { windowMs: 15 * 60 * 1000, maxRequests: 20 }; // 20 req/15min

// Upstash rate limiters (work across serverless instances)
// Only create if redis client is available
let defaultLimiter: Ratelimit | null = null;
let authLimiter: Ratelimit | null = null;

if (redis) {
  defaultLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(defaultConfig.maxRequests, `${defaultConfig.windowMs / 1000} s`),
    analytics: false,
  });
  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(authConfig.maxRequests, `${authConfig.windowMs / 1000} s`),
    analytics: false,
  });
}

// In-memory fallback for local dev (when no Redis configured)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

function inMemoryRateLimit(
  ip: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = ip || 'global-unknown';
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, resetIn: options.windowMs };
  }

  if (record.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: options.maxRequests - record.count, resetIn: record.resetTime - now };
}

export async function rateLimit(
  ip: string,
  options: 'default' | 'auth' | RateLimitOptions = 'default'
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const opts = options === 'default' ? defaultConfig
    : options === 'auth' ? authConfig
    : options;

  const limiter = options === 'auth' ? authLimiter : defaultLimiter;

  // If Redis limiter is available, use Upstash
  if (limiter) {
    try {
      const key = ip || 'global-unknown';
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining,
        resetIn: reset ? Math.max(0, reset - Date.now()) : opts.windowMs,
      };
    } catch (error) {
      console.error('Redis rate limit error, falling back to in-memory:', error);
      // Fall through to in-memory fallback
    }
  }

  // In-memory fallback
  return inMemoryRateLimit(ip, opts);
}
