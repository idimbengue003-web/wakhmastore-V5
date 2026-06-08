// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 30,          // 30 requests per minute
};

const authOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,            // 5 attempts per 15 minutes
};

export function rateLimit(
  ip: string,
  options: 'default' | 'auth' | RateLimitOptions = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  const opts = options === 'default' ? defaultOptions
    : options === 'auth' ? authOptions
    : options;

  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + opts.windowMs });
    return { allowed: true, remaining: opts.maxRequests - 1, resetIn: opts.windowMs };
  }

  if (record.count >= opts.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: opts.maxRequests - record.count, resetIn: record.resetTime - now };
}

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}
