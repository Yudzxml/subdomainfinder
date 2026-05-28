export async function getCrtShSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://crt.sh/?q=%.${domain}&output=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const subdomains = new Set<string>();

    for (const entry of data) {
      const names = entry.name_value.split('\n');
      for (const name of names) {
        const cleanName = name.trim().toLowerCase();
        if (cleanName && cleanName.includes(domain)) {
          subdomains.add(cleanName);
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('crt.sh error:', error);
    return [];
  }
}

export async function getAlienVaultSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    if (data.passive_dns && Array.isArray(data.passive_dns)) {
      for (const entry of data.passive_dns) {
        if (entry.hostname) {
          const cleanName = entry.hostname.toLowerCase().trim();
          if (cleanName.includes(domain)) {
            subdomains.add(cleanName);
          }
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('AlienVault error:', error);
    return [];
  }
}

export async function getBufferOverSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://dns.bufferover.run/dns?q=.${domain}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    if (data.FDNS_A && Array.isArray(data.FDNS_A)) {
      for (const entry of data.FDNS_A) {
        const subdomain = entry.split(',')[1];
        if (subdomain) {
          const cleanName = subdomain.toLowerCase().trim();
          subdomains.add(cleanName);
        }
      }
    }

    if (data.RDNS && Array.isArray(data.RDNS)) {
      for (const entry of data.RDNS) {
        const subdomain = entry.split(',')[1];
        if (subdomain) {
          const cleanName = subdomain.toLowerCase().trim();
          subdomains.add(cleanName);
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('BufferOver error:', error);
    return [];
  }
}

export async function getHackerTargetSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://api.hackertarget.com/hostsearch/?q=${domain}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    const subdomains = new Set<string>();

    const lines = text.split('\n');
    for (const line of lines) {
      const [subdomain] = line.split(',');
      if (subdomain) {
        const cleanName = subdomain.toLowerCase().trim();
        if (cleanName.includes(domain)) {
          subdomains.add(cleanName);
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('HackerTarget error:', error);
    return [];
  }
}

export async function getRapidDNSSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://rapiddns.io/subdomain/${domain}?full=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    const subdomains = new Set<string>();

    const regex = /<td><a[^>]*>([^<]+)<\/a><\/td>/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const subdomain = match[1].toLowerCase().trim();
      if (subdomain.includes(domain)) {
        subdomains.add(subdomain);
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('RapidDNS error:', error);
    return [];
  }
}

export async function getWaybackSubdomains(domain: string): Promise<string[]> {
  try {
    const url = `https://web.archive.org/cdx/search/cdx?url=*.${domain}/*&output=json&fl=host&collapse=urlkey`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    if (Array.isArray(data) && data.length > 0) {
      // Skip the first row (headers)
      for (let i = 1; i < data.length; i++) {
        const host = data[i][0];
        if (host) {
          const cleanName = host.toLowerCase().trim();
          if (cleanName.includes(domain)) {
            subdomains.add(cleanName);
          }
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('Wayback Machine error:', error);
    return [];
  }
}