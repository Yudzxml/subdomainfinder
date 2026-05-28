import { SubdomainResult, ScanStats, ScanProgress, ScanLog, ScanPhase, SSLInfo, SecurityHeaders } from '@/types/scan';
import { enumerateSubdomains } from './subdomain-enumerator';
import { detectCloudflare, detectWAF, extractTitle, detectTechStack, lookupDNS, getGeoLocation } from './scanner';
import { executeInParallel, debounce } from '@/lib/promise-pool';
import { scanCache, dnsCache, generateCacheKey } from '@/lib/cache';

const MAX_CONCURRENT_SCANS = 20;
const SCAN_TIMEOUT = 15000;
const DNS_TIMEOUT = 5000;

export async function scanDomain(
  domain: string,
  options: {
    onProgress?: (progress: ScanProgress) => void;
    includeDNS?: boolean;
    includeSSL?: boolean;
    includeHeaders?: boolean;
    maxSubdomains?: number;
  } = {}
): Promise<{ subdomains: SubdomainResult[]; stats: ScanStats; logs: ScanLog[] }> {
  const startTime = Date.now();
  const logs: ScanLog[] = [];

  const addLog = (phase: ScanPhase, message: string, subdomain?: string, details?: any) => {
    const log: ScanLog = {
      timestamp: new Date().toISOString(),
      phase,
      message,
      subdomain,
      details,
    };
    logs.push(log);
    return log;
  };

  const reportProgress = (phase: ScanPhase, progress: number, current: string, total: number) => {
    options.onProgress?.({
      phase,
      progress,
      current,
      total,
      logs,
    });
  };

  // Check cache first
  const cacheKey = generateCacheKey('scan', domain);
  const cached = scanCache.get(cacheKey);
  if (cached && !options.includeHeaders) {
    addLog('enumeration', 'Loaded from cache');
    return {
      subdomains: cached.subdomains,
      stats: cached.stats,
      logs,
    };
  }

  // Phase 1: Subdomain Enumeration
  addLog('enumeration', `Starting enumeration for ${domain}`);
  reportProgress('enumeration', 0, 'Starting enumeration...', 0);

  const { allSubdomains, sources } = await enumerateSubdomains(
    domain,
    (progress, source) => {
      addLog('enumeration', `Found subdomains from ${source}`, undefined, { progress, source });
      reportProgress('enumeration', Math.round(progress * 0.2), source, allSubdomains.length);
    }
  );

  const uniqueSubdomains = [...new Set(allSubdomains)].sort();

  // Limit if specified
  const subdomainsToScan = options.maxSubdomains
    ? uniqueSubdomains.slice(0, options.maxSubdomains)
    : uniqueSubdomains;

  reportProgress('enumeration', 20, `Found ${subdomainsToScan.length} subdomains`, subdomainsToScan.length);
  addLog('enumeration', `Found ${subdomainsToScan.length} unique subdomains`);

  // Phase 2: HTTP Scanning
  reportProgress('http_check', 20, 'Starting HTTP checks...', subdomainsToScan.length);

  const results: SubdomainResult[] = [];
  const scanProgress = { completed: 0, total: subdomainsToScan.length };

  const scanResults = await executeInParallel(
    subdomainsToScan,
    (subdomain, index) => scanSubdomain(subdomain, addLog, options),
    {
      concurrency: MAX_CONCURRENT_SCANS,
      timeout: SCAN_TIMEOUT,
      onProgress: (completed, total) => {
        scanProgress.completed = completed;
        const progress = 20 + Math.round((completed / total) * 40);
        reportProgress('http_check', progress, `Scanned ${completed}/${total} subdomains`, total);
        addLog('http_check', `Completed ${completed}/${total} scans`, undefined, { progress });
      },
    }
  );

  results.push(...scanResults.success);

  // Phase 3: DNS Lookup
  if (options.includeDNS !== false) {
    reportProgress('dns_resolution', 60, 'Resolving DNS records...', results.length);
    addLog('dns_resolution', 'Starting DNS resolution');

    const aliveSubdomains = results.filter((r) => r.alive);

    await executeInParallel(
      aliveSubdomains,
      async (result) => {
        try {
          const dnsKey = generateCacheKey('dns', result.subdomain);
          const cachedDNS = dnsCache.get(dnsKey);

          if (cachedDNS) {
            result.dnsRecords = cachedDNS;
            addLog('dns_resolution', `DNS loaded from cache`, result.subdomain);
          } else {
            result.dnsRecords = await lookupDNS(result.subdomain);
            dnsCache.set(dnsKey, result.dnsRecords);
            addLog('dns_resolution', `DNS resolved`, result.subdomain, result.dnsRecords);
          }
        } catch (error) {
          console.error(`DNS lookup error for ${result.subdomain}:`, error);
          addLog('dns_resolution', `DNS lookup failed`, result.subdomain, { error: (error as Error).message });
        }
      },
      {
        concurrency: 10,
        timeout: DNS_TIMEOUT,
        onProgress: (completed, total) => {
          const progress = 60 + Math.round((completed / total) * 15);
          reportProgress('dns_resolution', progress, `Resolved ${completed}/${total} DNS records`, total);
        },
      }
    );
  }

  // Phase 4: Security Headers Analysis
  if (options.includeHeaders !== false) {
    reportProgress('headers_analysis', 75, 'Analyzing security headers...', results.length);
    addLog('headers_analysis', 'Starting security header analysis');

    await executeInParallel(
      results.filter((r) => r.alive),
      async (result) => {
        try {
          result.securityHeaders = await analyzeSecurityHeaders(result.subdomain);
          addLog('headers_analysis', `Security headers analyzed`, result.subdomain, result.securityHeaders);
        } catch (error) {
          console.error(`Security headers error for ${result.subdomain}:`, error);
        }
      },
      {
        concurrency: 10,
        timeout: 10000,
      }
    );
  }

  // Phase 5: Risk Analysis
  reportProgress('risk_analysis', 85, 'Calculating risk scores...', results.length);
  addLog('risk_analysis', 'Starting risk analysis');

  results.forEach((result) => {
    result.riskScore = calculateRiskScore(result, results);
    result.riskLevel = getRiskLevel(result.riskScore);
    addLog('risk_analysis', `Risk score: ${result.riskScore}% (${result.riskLevel})`, result.subdomain);
  });

  const stats = calculateStats(results);

  // Cache results
  scanCache.set(cacheKey, {
    subdomains: results,
    stats,
    sources,
  });

  reportProgress('finalizing', 100, 'Scan complete!', results.length);
  addLog('finalizing', `Scan completed in ${Date.now() - startTime}ms`, undefined, { total: results.length });

  return {
    subdomains: results,
    stats,
    logs,
  };
}

async function scanSubdomain(
  subdomain: string,
  addLog: (phase: any, message: string, subdomain?: string, details?: any) => void,
  options: any
): Promise<SubdomainResult> {
  const result: SubdomainResult = {
    subdomain: subdomain.trim().toLowerCase(),
    status: null,
    alive: false,
    responseTime: 0,
    title: '',
    redirectUrl: null,
    redirectChain: [],
    server: '',
    ipAddress: '',
    cloudflare: false,
    waf: [],
    country: 'Unknown',
    asn: 'Unknown',
    ssl: false,
    sslInfo: undefined,
    riskScore: 0,
    riskLevel: 'low',
    techStack: [],
    dnsRecords: {},
    securityHeaders: {} as SecurityHeaders,
    source: 'Passive',
    lastChecked: new Date().toISOString(),
  };

  try {
    const startTime = Date.now();

    const response = await fetch(`https://${subdomain}`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(SCAN_TIMEOUT),
    });

    const responseTime = Date.now() - startTime;
    result.responseTime = responseTime;

    result.status = response.status;
    result.alive = response.status < 500;

    addLog('http_check', `HTTP ${response.status} - ${responseTime}ms`, subdomain);

    // Get server info
    result.server = response.headers.get('server') || '';

    // Check for redirect
    const location = response.headers.get('location');
    if (location) {
      result.redirectUrl = location;
      result.redirectChain.push(location);
      addLog('http_check', `Redirect to: ${location}`, subdomain);
    }

    // Get IP info (simplified for serverless)
    result.ipAddress = 'Unknown';

    // Detect Cloudflare
    addLog('cloudflare_detection', `Checking Cloudflare protection`, subdomain);
    const cfDetection = detectCloudflare(response.headers, result.ipAddress);
    result.cloudflare = cfDetection.isCloudflare;
    addLog('cloudflare_detection', `Cloudflare: ${cfDetection.isCloudflare}`, subdomain, cfDetection.indicators);

    // Detect WAF
    addLog('waf_detection', `Checking WAF`, subdomain);
    const wafDetection = detectWAF(response.headers, result.server);
    result.waf = wafDetection.detectedWAFs;
    addLog('waf_detection', `WAF: ${result.waf.join(', ') || 'None'}`, subdomain);

    // Check SSL
    result.ssl = true;
    if (options.includeSSL !== false) {
      result.sslInfo = await analyzeSSL(subdomain, addLog);
    }

    // Get title and tech stack if alive
    if (result.alive && result.status === 200) {
      try {
        const htmlResponse = await fetch(`https://${subdomain}`, {
          signal: AbortSignal.timeout(SCAN_TIMEOUT),
        });
        const html = await htmlResponse.text();
        result.title = await extractTitle(html);
        result.techStack = detectTechStack(response.headers, html);
        addLog('http_check', `Title: ${result.title}`, subdomain);
      } catch (error) {
        addLog('http_check', `Failed to extract title`, subdomain, { error: (error as Error).message });
      }
    }

    result.lastChecked = new Date().toISOString();
  } catch (error: any) {
    result.status = null;
    result.alive = false;
    result.lastChecked = new Date().toISOString();
    addLog('http_check', `Error: ${(error as Error).message}`, subdomain);
  }

  return result;
}

async function analyzeSecurityHeaders(hostname: string): Promise<SecurityHeaders> {
  const headers: SecurityHeaders = {
    'Content-Security-Policy': { present: false, value: '', status: 'missing' },
    'Strict-Transport-Security': { present: false, value: '', status: 'missing' },
    'X-Frame-Options': { present: false, value: '', status: 'missing' },
    'X-XSS-Protection': { present: false, value: '', status: 'missing' },
    'Referrer-Policy': { present: false, value: '', status: 'missing' },
    'Permissions-Policy': { present: false, value: '', status: 'missing' },
    'X-Content-Type-Options': { present: false, value: '', status: 'missing' },
    'X-Robots-Tag': { present: false, value: '', status: 'missing' },
  };

  try {
    const response = await fetch(`https://${hostname}`, {
      signal: AbortSignal.timeout(10000),
    });

    // Check each header
    const checkHeader = (name: keyof SecurityHeaders, validator?: (value: string) => 'good' | 'weak' | 'missing') => {
      const value = response.headers.get(name);
      headers[name] = {
        present: !!value,
        value: value || '',
        status: validator
          ? validator(value || '')
          : value
            ? 'good'
            : 'missing',
      };
    };

    // Content-Security-Policy
    checkHeader('Content-Security-Policy', (value) => {
      if (!value) return 'missing';
      if (value.includes('default-src')) return 'good';
      return 'weak';
    });

    // Strict-Transport-Security
    checkHeader('Strict-Transport-Security', (value) => {
      if (!value) return 'missing';
      const maxAge = value.match(/max-age=(\d+)/);
      if (maxAge) {
        headers['Strict-Transport-Security'].maxAge = parseInt(maxAge[1]);
        headers['Strict-Transport-Security'].includeSubDomains = value.includes('includeSubDomains');
        headers['Strict-Transport-Security'].preload = value.includes('preload');
      }
      return parseInt(maxAge?.[1] || '0') >= 31536000 ? 'good' : 'weak';
    });

    // X-Frame-Options
    checkHeader('X-Frame-Options', (value) => {
      if (!value) return 'missing';
      if (value === 'DENY' || value === 'SAMEORIGIN') return 'good';
      return 'weak';
    });

    // X-XSS-Protection
    checkHeader('X-XSS-Protection', (value) => {
      if (!value) return 'missing';
      return 'good';
    });

    // Referrer-Policy
    checkHeader('Referrer-Policy', (value) => {
      if (!value) return 'missing';
      if (['strict-origin-when-cross-origin', 'no-referrer', 'same-origin'].includes(value)) return 'good';
      return 'weak';
    });

    // Permissions-Policy
    checkHeader('Permissions-Policy');

    // X-Content-Type-Options
    checkHeader('X-Content-Type-Options', (value) => {
      if (!value) return 'missing';
      return value === 'nosniff' ? 'good' : 'weak';
    });

    // X-Robots-Tag
    checkHeader('X-Robots-Tag');
  } catch (error) {
    console.error(`Security headers error for ${hostname}:`, error);
  }

  return headers;
}

async function analyzeSSL(hostname: string, addLog: any): Promise<SSLInfo> {
  const sslInfo: SSLInfo = {
    active: true,
    issuer: 'Unknown',
    subject: hostname,
    validFrom: '',
    validTo: '',
    daysRemaining: 0,
    tlsVersion: 'TLS 1.3',
    cipher: 'Unknown',
    isExpired: false,
    isSelfSigned: false,
    isValid: true,
    warnings: [],
  };

  try {
    const response = await fetch(`https://${hostname}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.url.startsWith('https://')) {
      sslInfo.active = true;
      addLog('ssl_analysis', `SSL active for ${hostname}`, hostname);
    } else {
      sslInfo.active = false;
      sslInfo.warnings.push('Not using HTTPS');
      addLog('ssl_analysis', `SSL not active for ${hostname}`, hostname);
    }
  } catch (error) {
    sslInfo.active = false;
    sslInfo.warnings.push('SSL handshake failed');
    addLog('ssl_analysis', `SSL failed for ${hostname}`, hostname);
  }

  return sslInfo;
}

function calculateRiskScore(result: SubdomainResult, allResults: SubdomainResult[]): number {
  let score = 0;

  // Base checks
  if (!result.cloudflare && !result.waf.length) {
    score += 25;
  }

  // Admin/portal detection
  const isAdmin = /admin|login|portal|dashboard|cpanel|webmail/i.test(result.subdomain);
  if (isAdmin) {
    score += 35;
  }

  // Risk keywords
  const riskKeywords = ['test', 'dev', 'staging', 'backup', 'old', 'temp', 'internal', 'private'];
  if (riskKeywords.some((keyword) => result.subdomain.includes(keyword))) {
    score += 20;
  }

  // Security headers
  const headers = result.securityHeaders;
  let missingHeaders = 0;
  if (!headers['Content-Security-Policy'].present) missingHeaders++;
  if (!headers['Strict-Transport-Security'].present) missingHeaders++;
  if (!headers['X-Frame-Options'].present) missingHeaders++;
  if (!headers['X-Content-Type-Options'].present) missingHeaders++;

  score += missingHeaders * 5;

  // SSL issues
  if (result.sslInfo) {
    if (!result.sslInfo.active) score += 15;
    if (result.sslInfo.isExpired) score += 30;
    if (result.sslInfo.warnings.length > 0) score += 10;
  }

  // Response time (very slow might indicate issues)
  if (result.responseTime > 5000) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function calculateStats(subdomains: SubdomainResult[]): ScanStats {
  const total = subdomains.length;
  const alive = subdomains.filter((s) => s.alive).length;
  const dead = total - alive;
  const protected_ = subdomains.filter((s) => s.cloudflare).length;
  const nonProtected = total - protected_;

  const uniqueIPs = new Set(
    subdomains
      .filter((s) => s.ipAddress && s.ipAddress !== 'Unknown')
      .map((s) => s.ipAddress)
  ).size;

  const wafCount = subdomains.filter((s) => s.waf.length > 0).length;

  const criticalRisk = subdomains.filter((s) => s.riskLevel === 'critical').length;
  const highRisk = subdomains.filter((s) => s.riskLevel === 'high').length;
  const mediumRisk = subdomains.filter((s) => s.riskLevel === 'medium').length;
  const lowRisk = subdomains.filter((s) => s.riskLevel === 'low').length;

  let sslValid = 0, sslExpired = 0, sslWeak = 0;
  subdomains.forEach((s) => {
    if (s.sslInfo) {
      if (s.sslInfo.isValid) sslValid++;
      else if (s.sslInfo.isExpired) sslExpired++;
      else sslWeak++;
    }
  });

  const averageResponseTime =
    subdomains.length > 0
      ? Math.round(
          subdomains.reduce((sum, s) => sum + s.responseTime, 0) / subdomains.length
        )
      : 0;

  return {
    total,
    alive,
    dead,
    protected: protected_,
    nonProtected,
    uniqueIPs,
    wafCount,
    highRisk: highRisk + criticalRisk,
    mediumRisk,
    lowRisk,
    criticalRisk,
    averageResponseTime,
    sslValid,
    sslExpired,
    sslWeak,
  };
}

export function exportResults(
  subdomains: SubdomainResult[],
  format: 'json' | 'csv' | 'txt'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(subdomains, null, 2);

    case 'csv':
      const headers = [
        'Subdomain',
        'Status',
        'Alive',
        'Response Time',
        'Title',
        'IP Address',
        'Server',
        'Cloudflare',
        'WAF',
        'Country',
        'Risk Score',
        'Risk Level',
        'SSL',
      ];

      const rows = subdomains.map((s) =>
        [
          s.subdomain,
          s.status,
          s.alive,
          s.responseTime,
          `"${s.title}"`,
          s.ipAddress,
          s.server,
          s.cloudflare,
          s.waf.join(';'),
          s.country,
          s.riskScore,
          s.riskLevel,
          s.ssl,
        ].join(',')
      );

      return [headers.join(','), ...rows].join('\n');

    case 'txt':
      return subdomains.map((s) => s.subdomain).join('\n');

    default:
      return '';
  }
}