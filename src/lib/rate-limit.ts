// Server only. In-memory IP rate limiter for API routes.
const ipMap = new Map<string, number[]>();

export function checkIpRateLimit(
  ip: string,
  maxRequests = 30,
  windowMs = 10 * 60 * 1000 // 10 minutes
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (ipMap.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  ipMap.set(ip, timestamps);

  // Periodic cleanup if map grows
  if (ipMap.size > 2000) {
    for (const [k, v] of ipMap.entries()) {
      if (v.every((t) => now - t >= windowMs)) {
        ipMap.delete(k);
      }
    }
  }

  return { allowed: true, remaining: maxRequests - timestamps.length };
}

