const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per user
const MAX_USERS = 10000;
const userLimitMap = new Map();

// Periodic cleanup of stale rate-limit windows
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userLimitMap) {
    if (now - entry.startedAt >= WINDOW_MS) {
      userLimitMap.delete(key);
    }
  }
}, WINDOW_MS);

cleanupTimer.unref?.();

/**
 * Per-user rate limiting middleware for chatbot route.
 * Tracks usage based on authenticated user ID (or fallback IP).
 */
export default function chatRateLimit(req, res, next) {
  const userId = req.user?.id || req.user?._id?.toString() || req.ip || 'anonymous';
  const now = Date.now();

  let entry = userLimitMap.get(userId);
  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    if (userLimitMap.size >= MAX_USERS) {
      userLimitMap.delete(userLimitMap.keys().next().value);
    }
    entry = { startedAt: now, count: 0 };
    userLimitMap.set(userId, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const resetSeconds = Math.ceil((entry.startedAt + WINDOW_MS - now) / 1000);

  res.set('RateLimit-Limit', String(MAX_REQUESTS));
  res.set('RateLimit-Remaining', String(remaining));
  res.set('RateLimit-Reset', String(resetSeconds));

  if (entry.count > MAX_REQUESTS) {
    res.set('Retry-After', String(resetSeconds));
    return res.status(429).json({
      message: 'Too many chat messages. Please wait a moment before sending another message.'
    });
  }

  next();
}

/**
 * Testing helper to reset the rate limiter map.
 */
export function _resetChatRateLimitForTesting() {
  userLimitMap.clear();
}

