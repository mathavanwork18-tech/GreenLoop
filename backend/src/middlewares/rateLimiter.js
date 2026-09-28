/**
 * Lightweight, zero-dependency sliding-window in-memory rate limiter.
 * Provides defensive rate-limiting for abuse-sensitive and high-traffic endpoints.
 */

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests from this IP address. Please wait a moment and try again.',
  keyGenerator = (req) => {
    return (
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'anonymous'
    );
  },
} = {}) {
  const store = new Map();

  // Periodic memory cleanup every 2 minutes
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.resetTime > windowMs) {
        store.delete(key);
      }
    }
  }, 2 * 60 * 1000);

  if (interval.unref) {
    interval.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs };
      store.set(key, entry);
    } else {
      entry.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    next();
  };
}

// Pre-configured rate limiters based on environment or safe defaults
export const authLimiter = createRateLimiter({
  windowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT) || 20,
  message: 'Too many authentication attempts. Please wait a minute before trying again.',
});

export const aiLimiter = createRateLimiter({
  windowMs: Number(process.env.AI_RATE_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT) || 30,
  message: 'AI request capacity reached for this IP. Please wait a moment before sending more queries.',
});

export const paymentLimiter = createRateLimiter({
  windowMs: Number(process.env.PAYMENT_RATE_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.PAYMENT_RATE_LIMIT) || 30,
  message: 'Too many payment requests initiated. Please wait a moment.',
});

export const apiLimiter = createRateLimiter({
  windowMs: Number(process.env.API_RATE_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT) || 120,
  message: 'API rate limit exceeded. Please wait a moment.',
});
