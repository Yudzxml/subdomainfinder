import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, updateSessionActivity, isValidDomain, normalizeDomain, isBlockedDomain } from '@/lib/session';
import { checkAbuse, checkScanAbuse } from '@/lib/anti-abuse';
import { scanDomain, ScanProgress } from '@/services/scan-service';
import { scanCache } from '@/lib/cache';

export const maxDuration = 300; // 5 minutes

// GET /api/scan - Start scan with progress updates
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const scanId = crypto.randomUUID();
  const logs: any[] = [];

  const addLog = (phase: string, message: string, details?: any) => {
    const log = {
      timestamp: new Date().toISOString(),
      scanId,
      phase,
      message,
      details,
    };
    logs.push(log);
    console.log(`[${scanId}] [${phase}] ${message}`);
  };

  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      addLog('error', 'No session found');
      return NextResponse.json(
        {
          success: false,
          message: 'Session required. Please refresh the page.',
          scanId,
          logs,
        },
        { status: 401 }
      );
    }

    // Verify session
    const session = await verifySession(sessionCookie.value);
    if (!session) {
      addLog('error', 'Invalid session');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid session. Please refresh the page.',
          scanId,
          logs,
        },
        { status: 401 }
      );
    }

    addLog('session', `Session verified: ${session.sessionId}`);

    // Check abuse
    const abuseCheck = checkAbuse(request, session.sessionId);
    if (!abuseCheck.allowed) {
      addLog('security', `Abuse detected: ${abuseCheck.reason}`);
      return NextResponse.json(
        {
          success: false,
          message: abuseCheck.reason,
          blockedUntil: abuseCheck.blockedUntil,
          scanId,
          logs,
        },
        { status: 429 }
      );
    }

    // Check scan cooldown
    const scanAbuse = checkScanAbuse(session.sessionId);
    if (!scanAbuse.allowed) {
      addLog('security', `Scan cooldown: ${scanAbuse.reason}`);
      return NextResponse.json(
        {
          success: false,
          message: scanAbuse.reason,
          blockedUntil: scanAbuse.blockedUntil,
          scanId,
          logs,
        },
        { status: 429 }
      );
    }

    // Get domain from query params
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      addLog('validation', 'No domain provided');
      return NextResponse.json(
        {
          success: false,
          message: 'Domain parameter is required',
          scanId,
          logs,
        },
        { status: 400 }
      );
    }

    // Validate domain
    if (!isValidDomain(domain)) {
      addLog('validation', `Invalid domain: ${domain}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid domain format',
          scanId,
          logs,
        },
        { status: 400 }
      );
    }

    // Check for blocked domains
    if (isBlockedDomain(domain)) {
      addLog('security', `Blocked domain: ${domain}`);
      return NextResponse.json(
        {
          success: false,
          message: 'This domain is not allowed for scanning',
          scanId,
          logs,
        },
        { status: 403 }
      );
    }

    const normalizedDomain = normalizeDomain(domain);
    addLog('validation', `Domain validated: ${normalizedDomain}`);

    // Check cache
    const cacheKey = `scan:${normalizedDomain}`;
    const cached = scanCache.get(cacheKey);

    if (cached && !searchParams.get('forceRefresh')) {
      addLog('cache', 'Found cached results');
      return NextResponse.json(
        {
          success: true,
          domain: normalizedDomain,
          subdomains: cached.subdomains,
          stats: cached.stats,
          sources: cached.sources,
          timestamp: new Date().toISOString(),
          duration: 0,
          cached: true,
          scanId,
          logs,
        },
        { status: 200 }
      );
    }

    // Update session activity
    const newSessionToken = await updateSessionActivity(sessionCookie.value);
    if (newSessionToken) {
      cookieStore.set('session', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    addLog('scan', 'Starting scan...');

    // Perform scan with progress callback
    const scanResults = await scanDomain(normalizedDomain, {
      onProgress: (progress: ScanProgress) => {
        addLog(progress.phase, `${progress.current} (${progress.progress}%)`, {
          progress: progress.progress,
          total: progress.total,
          logsCount: progress.logs.length,
        });
      },
      includeDNS: searchParams.get('includeDNS') !== 'false',
      includeSSL: searchParams.get('includeSSL') !== 'false',
      includeHeaders: searchParams.get('includeHeaders') !== 'false',
      maxSubdomains: searchParams.get('maxSubdomains')
        ? parseInt(searchParams.get('maxSubdomains')!)
        : undefined,
    });

    const duration = Date.now() - startTime;
    addLog('scan', `Scan completed in ${duration}ms`, {
      subdomainsCount: scanResults.subdomains.length,
      stats: scanResults.stats,
    });

    // Cache results
    scanCache.set(cacheKey, {
      domain: normalizedDomain,
      subdomains: scanResults.subdomains,
      stats: scanResults.stats,
      sources: scanResults.logs,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        domain: normalizedDomain,
        subdomains: scanResults.subdomains,
        stats: scanResults.stats,
        sources: scanResults.logs,
        timestamp: new Date().toISOString(),
        duration,
        cached: false,
        scanId,
        logs: scanResults.logs,
      },
      { status: 200 }
    );
  } catch (error: any) {
    addLog('error', `Scan failed: ${error.message}`, {
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred during scanning',
        scanId,
        logs,
      },
      { status: 500 }
    );
  }
}

// POST /api/scan - Start scan
export async function POST(request: NextRequest) {
  return GET(request);
}