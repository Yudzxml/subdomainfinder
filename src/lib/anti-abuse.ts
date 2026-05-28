import { checkRateLimit, checkScanCooldown } from './rate-limit';
import { generateFingerprint } from './session';

const BLOCKED_IPS = new Set<string>();
const SUSPICIOUS_REQUESTS = new Map<string, number>();

const SUSPICIOUS_THRESHOLD = 20;
const SUSPICIOUS_WINDOW = 5 * 60 * 1000; // 5 minutes

export interface AbuseCheckResult {
  allowed: boolean;
  reason?: string;
  blockedUntil?: string;
}

export function checkAbuse(request: Request, sessionId?: string): AbuseCheckResult {
  const fingerprint = generateFingerprint(request);
  const identifier = sessionId || fingerprint;

  // Check rate limiting
  const rateLimit = checkRateLimit(identifier, 15, 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      reason: 'Too many requests. Please wait.',
      blockedUntil: rateLimit.resetAt,
    };
  }

  // Check suspicious activity
  const suspiciousCount = SUSPICIOUS_REQUESTS.get(identifier) || 0;
  SUSPICIOUS_REQUESTS.set(identifier, suspiciousCount + 1);

  if (suspiciousCount > SUSPICIOUS_THRESHOLD) {
    BLOCKED_IPS.add(fingerprint);

    return {
      allowed: false,
      reason: 'Suspicious activity detected. Temporarily blocked.',
      blockedUntil: new Date(Date.now() + SUSPICIOUS_WINDOW).toISOString(),
    };
  }

  // Cleanup old suspicious counts
  setTimeout(() => {
    const count = SUSPICIOUS_REQUESTS.get(identifier) || 0;
    if (count > 0) {
      SUSPICIOUS_REQUESTS.set(identifier, Math.max(0, count - 1));
    }
  }, SUSPICIOUS_WINDOW);

  return { allowed: true };
}

export function checkScanAbuse(sessionId: string): AbuseCheckResult {
  const cooldown = checkScanCooldown(sessionId);

  if (!cooldown.allowed) {
    return {
      allowed: false,
      reason: `Please wait ${Math.ceil(cooldown.waitTime / 1000)} seconds before scanning again.`,
      blockedUntil: new Date(Date.now() + cooldown.waitTime).toISOString(),
    };
  }

  return { allowed: true };
}

export function isBlocked(fingerprint: string): boolean {
  return BLOCKED_IPS.has(fingerprint);
}

export function cleanupBlocked(): void {
  // This would typically be called periodically
  // For now, blocked IPs stay blocked for the session duration
}