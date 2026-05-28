import {
  getCrtShSubdomains,
  getAlienVaultSubdomains,
  getBufferOverSubdomains,
  getHackerTargetSubdomains,
  getRapidDNSSubdomains,
  getWaybackSubdomains,
} from './subdomain-sources';

export interface SourceResult {
  source: string;
  subdomains: string[];
  duration: number;
}

export async function enumerateSubdomains(
  domain: string,
  onProgress?: (progress: number, source: string) => void
): Promise<{ allSubdomains: string[]; sources: SourceResult[] }> {
  const sources = [
    { name: 'crt.sh', fn: getCrtShSubdomains },
    { name: 'AlienVault', fn: getAlienVaultSubdomains },
    { name: 'BufferOver', fn: getBufferOverSubdomains },
    { name: 'HackerTarget', fn: getHackerTargetSubdomains },
    { name: 'RapidDNS', fn: getRapidDNSSubdomains },
    { name: 'Wayback Machine', fn: getWaybackSubdomains },
  ];

  const allSubdomains = new Set<string>();
  const sourceResults: SourceResult[] = [];

  for (let i = 0; i < sources.length; i++) {
    const { name, fn } = sources[i];
    const startTime = Date.now();

    try {
      const subdomains = await fn(domain);
      const duration = Date.now() - startTime;

      for (const subdomain of subdomains) {
        const clean = subdomain.trim().toLowerCase();
        if (clean && clean.includes(domain)) {
          allSubdomains.add(clean);
        }
      }

      sourceResults.push({
        source: name,
        subdomains: subdomains,
        duration,
      });

      onProgress?.(
        Math.round(((i + 1) / sources.length) * 100),
        name
      );
    } catch (error) {
      console.error(`Error fetching from ${name}:`, error);
      sourceResults.push({
        source: name,
        subdomains: [],
        duration: 0,
      });
    }
  }

  // Sort subdomains alphabetically
  const sortedSubdomains = Array.from(allSubdomains).sort();

  return {
    allSubdomains: sortedSubdomains,
    sources: sourceResults,
  };
}

export function normalizeSubdomain(subdomain: string, domain: string): string {
  let normalized = subdomain.trim().toLowerCase();

  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');

  // Remove port
  normalized = normalized.replace(/:\d+$/, '');

  // Remove path
  normalized = normalized.split('/')[0];

  return normalized;
}

export function isValidSubdomain(subdomain: string, domain: string): boolean {
  const normalized = normalizeSubdomain(subdomain, domain);
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(normalized) && normalized.includes(domain);
}