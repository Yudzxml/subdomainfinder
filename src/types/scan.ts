export interface SubdomainResult {
  subdomain: string;
  status: number | null;
  alive: boolean;
  responseTime: number;
  title: string;
  redirectUrl: string | null;
  redirectChain: string[];
  server: string;
  ipAddress: string;
  cloudflare: boolean;
  waf: string[];
  country: string;
  asn: string;
  ssl: boolean;
  sslInfo?: SSLInfo;
  riskScore: number;
  riskLevel: RiskLevel;
  techStack: string[];
  dnsRecords: DNSRecords;
  securityHeaders: SecurityHeaders;
  source: string;
  lastChecked: string;
}

export interface SSLInfo {
  active: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  tlsVersion: string;
  cipher: string;
  isExpired: boolean;
  isSelfSigned: boolean;
  isValid: boolean;
  warnings: string[];
}

export interface SecurityHeaders {
  'Content-Security-Policy': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'Strict-Transport-Security': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  'X-Frame-Options': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'X-XSS-Protection': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'Referrer-Policy': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'Permissions-Policy': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'X-Content-Type-Options': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
  'X-Robots-Tag': {
    present: boolean;
    value: string;
    status: 'good' | 'weak' | 'missing';
  };
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DNSRecords {
  A?: string[];
  AAAA?: string[];
  TXT?: string[];
  MX?: string[];
  NS?: string[];
  CNAME?: string[];
  SOA?: string[];
  SRV?: string[];
}

export interface ScanStats {
  total: number;
  alive: number;
  dead: number;
  protected: number;
  nonProtected: number;
  uniqueIPs: number;
  wafCount: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  criticalRisk: number;
  averageResponseTime: number;
  sslValid: number;
  sslExpired: number;
  sslWeak: number;
}

export interface ScanRequest {
  domain: string;
  includeDNS?: boolean;
  includeSSL?: boolean;
  includeHeaders?: boolean;
  maxSubdomains?: number;
}

export interface ScanResponse {
  domain: string;
  subdomains: SubdomainResult[];
  stats: ScanStats;
  timestamp: string;
  duration: number;
  sources: SourceResult[];
}

export interface SourceResult {
  source: string;
  subdomains: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  scanCount: number;
  lastScan?: string;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
}

export interface FilterOptions {
  cloudflare?: boolean;
  alive?: boolean;
  dead?: boolean;
  status200?: boolean;
  highRisk?: boolean;
  adminPortal?: boolean;
  waf?: string;
  riskLevel?: RiskLevel;
  sslValid?: boolean;
  sslExpired?: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'txt';

export const WAF_TYPES = [
  'Cloudflare',
  'Akamai',
  'AWS CloudFront',
  'Fastly',
  'Imperva',
  'Sucuri',
  'NGINX Proxy',
  'None',
] as const;

export type WAFType = typeof WAF_TYPES[number];

export const CLOUDFLARE_IP_RANGES = [
  '104.16.0.0/12',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '188.114.96.0/20',
];

export const CLOUDFLARE_ASN = 'AS13335';

export const ADMIN_PATTERNS = [
  /admin/i,
  /administrator/i,
  /wp-admin/i,
  /login/i,
  /dashboard/i,
  /cpanel/i,
  /webmail/i,
  /portal/i,
];

export const RISK_KEYWORDS = [
  'test',
  'dev',
  'staging',
  'backup',
  'old',
  'temp',
  'demo',
  'preview',
  'beta',
  'internal',
  'secret',
  'private',
];

export interface ScanLog {
  timestamp: string;
  phase: ScanPhase;
  message: string;
  subdomain?: string;
  details?: any;
}

export type ScanPhase =
  | 'enumeration'
  | 'dns_resolution'
  | 'http_check'
  | 'cloudflare_detection'
  | 'waf_detection'
  | 'ssl_analysis'
  | 'headers_analysis'
  | 'risk_analysis'
  | 'finalizing';

export interface ScanProgress {
  phase: ScanPhase;
  progress: number;
  current: string;
  total: number;
  logs: ScanLog[];
}

export type ViewMode = 'list' | 'grid' | 'table';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  scanCount: number;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface SavedScan {
  id: string;
  userId: string;
  domain: string;
  subdomains: SubdomainResult[];
  stats: ScanStats;
  timestamp: Date;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
}

export interface AbuseLog {
  id: string;
  sessionId: string;
  fingerprint: string;
  ip?: string;
  reason: string;
  timestamp: Date;
  blockedUntil?: Date;
}

export interface APILog {
  id: string;
  sessionId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

export interface MonitoringData {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageScanTime: number;
  activeSessions: number;
  blockedIPs: number;
  rateLimitHits: number;
  sourceHealth: Record<string, { success: number; failed: number; lastCheck: Date }>;
}