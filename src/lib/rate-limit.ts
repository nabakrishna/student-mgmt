/**
 * Simple in-memory sliding-window rate limiter.
 * Works for single-process deployments (dev + single-instance prod).
 *
 * For multi-instance deployments, swap the Map for a Redis store.
 */

interface Bucket {
  timestamps: number[]; // epoch ms of each attempt
}

const store = new Map<string, Bucket>();

// Clean up stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000; // older than 15 min
  for (const [key, bucket] of store.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check whether a key (e.g. IP address) has exceeded the allowed number
 * of attempts within the sliding window.
 *
 * @param key       - Identifier to rate-limit (IP, username, etc.)
 * @param limit     - Maximum allowed attempts in the window (default 10)
 * @param windowMs  - Window duration in ms (default 15 minutes)
 * @returns `{ allowed: boolean; remaining: number; retryAfterMs: number }`
 */
export function checkRateLimit(
  key: string,
  limit  = 10,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now    = Date.now();
  const cutoff = now - windowMs;

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    store.set(key, bucket);
  }

  // Drop attempts outside the window
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest      = bucket.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  // Record this attempt
  bucket.timestamps.push(now);
  return { allowed: true, remaining: limit - bucket.timestamps.length, retryAfterMs: 0 };
}