interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000; // 1 minute
const COOLDOWN_MS = 5 * 1000; // 5 seconds between scans

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(newEntry.resetAt).toISOString(),
      limit,
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt).toISOString(),
      limit,
    };
  }

  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: new Date(entry.resetAt).toISOString(),
    limit,
  };
}

const lastScanStore = new Map<string, number>();

export function checkScanCooldown(identifier: string): { allowed: boolean; waitTime: number } {
  const now = Date.now();
  const lastScan = lastScanStore.get(identifier);

  if (!lastScan) {
    lastScanStore.set(identifier, now);
    return { allowed: true, waitTime: 0 };
  }

  const elapsed = now - lastScan;

  if (elapsed < COOLDOWN_MS) {
    return { allowed: false, waitTime: COOLDOWN_MS - elapsed };
  }

  lastScanStore.set(identifier, now);
  return { allowed: true, waitTime: 0 };
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);