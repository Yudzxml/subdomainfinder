import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-min-32-chars-long'
);

export interface SessionPayload {
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  scanCount: number;
}

export async function createSession(): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  const payload: SessionPayload = {
    sessionId,
    createdAt: now,
    lastActivity: now,
    scanCount: 0,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function updateSessionActivity(token: string): Promise<string | null> {
  const session = await verifySession(token);
  if (!session) return null;

  session.lastActivity = Date.now();
  session.scanCount += 1;

  const newToken = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(session.createdAt)
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  return newToken;
}

export function generateFingerprint(request: Request): string {
  const headers = request.headers;
  const fingerprint = [
    headers.get('user-agent') || '',
    headers.get('accept-language') || '',
    headers.get('accept-encoding') || '',
  ].join('|');

  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

export function isValidDomain(domain: string): boolean {
  if (!domain) return false;

  // Remove protocol and path
  const cleanDomain = domain.replace(/^(https?:\/\/)?/, '').split('/')[0];

  // Basic domain regex
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  return domainRegex.test(cleanDomain);
}

export function normalizeDomain(domain: string): string {
  return domain.replace(/^(https?:\/\/)?/, '').split('/')[0].toLowerCase().trim();
}

export function isBlockedDomain(domain: string): boolean {
  const blockedDomains = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'example.com',
    'test.com',
  ];

  const normalized = normalizeDomain(domain);
  return blockedDomains.includes(normalized);
}