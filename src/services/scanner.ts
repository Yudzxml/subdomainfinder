import { CLOUDFLARE_IP_RANGES, CLOUDFLARE_ASN, DNSRecords } from '@/types/scan';

export interface CloudflareDetectionResult {
  isCloudflare: boolean;
  indicators: {
    serverHeader: boolean;
    cfRay: boolean;
    cfCache: boolean;
    ipRange: boolean;
    asn: boolean;
  };
  server: string;
}

export function isIPInCloudflareRange(ip: string): boolean {
  // Simple check for common Cloudflare IP prefixes
  const cloudflarePrefixes = [
    '104.16.', '104.17.', '104.18.', '104.19.', '104.20.', '104.21.', '104.22.',
    '104.23.', '104.24.', '104.25.', '104.26.', '104.27.', '104.28.', '104.29.',
    '104.30.', '104.31.',
    '172.64.', '172.65.', '172.66.', '172.67.', '172.68.', '172.69.', '172.70.',
    '172.71.', '172.72.', '172.73.', '172.74.', '172.75.', '172.76.',
    '131.0.72.', '131.0.73.', '131.0.74.', '131.0.75.',
    '188.114.96.', '188.114.97.', '188.114.98.', '188.114.99.',
    '188.114.100.', '188.114.101.', '188.114.102.', '188.114.103.',
    '188.114.104.', '188.114.105.', '188.114.106.', '188.114.107.',
    '188.114.108.', '188.114.109.', '188.114.110.', '188.114.111.',
  ];

  return cloudflarePrefixes.some((prefix) => ip.startsWith(prefix));
}

export function detectCloudflare(
  headers: Headers,
  ipAddress: string,
  asn?: string
): CloudflareDetectionResult {
  const server = headers.get('server') || '';
  const cfRay = headers.get('cf-ray');
  const cfCache = headers.get('cf-cache-status');

  const result: CloudflareDetectionResult = {
    isCloudflare: false,
    indicators: {
      serverHeader: false,
      cfRay: false,
      cfCache: false,
      ipRange: false,
      asn: false,
    },
    server,
  };

  // Check server header
  if (server.toLowerCase().includes('cloudflare')) {
    result.indicators.serverHeader = true;
  }

  // Check CF-Ray header
  if (cfRay) {
    result.indicators.cfRay = true;
  }

  // Check CF-Cache-Status header
  if (cfCache) {
    result.indicators.cfCache = true;
  }

  // Check IP range
  if (isIPInCloudflareRange(ipAddress)) {
    result.indicators.ipRange = true;
  }

  // Check ASN
  if (asn && asn.includes(CLOUDFLARE_ASN)) {
    result.indicators.asn = true;
  }

  // Determine if Cloudflare based on indicators
  result.isCloudflare =
    result.indicators.serverHeader ||
    result.indicators.cfRay ||
    result.indicators.cfCache ||
    result.indicators.ipRange ||
    result.indicators.asn;

  return result;
}

export interface WAFDetectionResult {
  detectedWAFs: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function detectWAF(headers: Headers, server: string): WAFDetectionResult {
  const detectedWAFs: string[] = [];

  const serverLower = server.toLowerCase();
  const cfRay = headers.get('cf-ray');
  const cfCache = headers.get('cf-cache-status');
  const akamaiOriginHop = headers.get('akamai-origin-hop');
  const xAmzCfId = headers.get('x-amz-cf-id');
  const xServedBy = headers.get('x-served-by');
  const xCache = headers.get('x-cache');
  const xSucuriCache = headers.get('x-sucuri-cache');
  const xSucuriId = headers.get('x-sucuri-id');

  // Cloudflare
  if (
    serverLower.includes('cloudflare') ||
    cfRay ||
    cfCache ||
    isIPInCloudflareRange('')
  ) {
    detectedWAFs.push('Cloudflare');
  }

  // Akamai
  if (
    serverLower.includes('akamai') ||
    serverLower.includes('akamaighost') ||
    akamaiOriginHop
  ) {
    detectedWAFs.push('Akamai');
  }

  // AWS CloudFront
  if (
    serverLower.includes('cloudfront') ||
    xAmzCfId ||
    headers.get('via')?.includes('CloudFront')
  ) {
    detectedWAFs.push('AWS CloudFront');
  }

  // Fastly
  if (
    serverLower.includes('fastly') ||
    xServedBy?.includes('cache') ||
    xCache?.includes('HIT')
  ) {
    detectedWAFs.push('Fastly');
  }

  // Imperva
  if (
    serverLower.includes('imperva') ||
    headers.get('x-incap') ||
    headers.get('x-cdn')
  ) {
    detectedWAFs.push('Imperva');
  }

  // Sucuri
  if (xSucuriCache || xSucuriId) {
    detectedWAFs.push('Sucuri');
  }

  // NGINX Proxy
  if (serverLower.includes('nginx') && headers.get('x-real-ip')) {
    detectedWAFs.push('NGINX Proxy');
  }

  const confidence: 'high' | 'medium' | 'low' =
    detectedWAFs.length > 0 ? 'high' : 'low';

  return {
    detectedWAFs,
    confidence,
  };
}

export async function extractTitle(html: string): Promise<string> {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (titleMatch) {
    return titleMatch[1].trim().substring(0, 100);
  }

  // Try to extract from h1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (h1Match) {
    return h1Match[1].trim().substring(0, 100);
  }

  return '';
}

export function detectTechStack(headers: Headers, html: string): string[] {
  const techStack: string[] = [];

  const server = headers.get('server')?.toLowerCase() || '';
  const xPoweredBy = headers.get('x-powered-by')?.toLowerCase() || '';
  const xAspNetVersion = headers.get('x-aspnet-version')?.toLowerCase() || '';
  const xPhpVersion = headers.get('x-php-version')?.toLowerCase() || '';
  const htmlLower = html.toLowerCase();

  // Server detection
  if (server.includes('nginx')) techStack.push('Nginx');
  if (server.includes('apache')) techStack.push('Apache');
  if (server.includes('iis') || server.includes('microsoft-iis')) techStack.push('IIS');
  if (server.includes('cloudflare')) techStack.push('Cloudflare');
  if (server.includes('gunicorn')) techStack.push('Gunicorn');
  if (server.includes('uwsgi')) techStack.push('uWSGI');
  if (server.includes('passenger')) techStack.push('Phusion Passenger');
  if (server.includes('litespeed')) techStack.push('LiteSpeed');
  if (server.includes('caddy')) techStack.push('Caddy');

  // Framework detection from headers
  if (xPoweredBy.includes('express')) techStack.push('Express');
  if (xPoweredBy.includes('next.js')) techStack.push('Next.js');
  if (xPoweredBy.includes('remix')) techStack.push('Remix');
  if (xPoweredBy.includes('nuxt')) techStack.push('Nuxt.js');
  if (xPoweredBy.includes('sveltekit')) techStack.push('SvelteKit');
  if (xPoweredBy.includes('php')) techStack.push('PHP');
  if (xPoweredBy.includes('laravel')) techStack.push('Laravel');
  if (xPoweredBy.includes('asp.net') || xAspNetVersion) techStack.push('ASP.NET');
  if (xPoweredBy.includes('python')) techStack.push('Python');
  if (xPoweredBy.includes('django')) techStack.push('Django');
  if (xPoweredBy.includes('flask')) techStack.push('Flask');
  if (xPoweredBy.includes('ruby')) techStack.push('Ruby');
  if (xPoweredBy.includes('rails')) techStack.push('Ruby on Rails');
  if (xPoweredBy.includes('node.js')) techStack.push('Node.js');
  if (xPoweredBy.includes('go')) techStack.push('Go');

  // PHP version from header
  if (xPhpVersion) techStack.push('PHP');

  // ASP.NET specific
  if (xAspNetVersion) {
    techStack.push('ASP.NET');
  }

  // Frontend framework detection from HTML
  const frameworks = [
    { name: 'React', patterns: ['react', 'reactdom', '_react', 'data-reactroot'] },
    { name: 'Vue.js', patterns: ['vue', 'vue-router', 'v-if', 'v-for', '__vue__'] },
    { name: 'Angular', patterns: ['ng-app', 'ng-controller', 'angular', 'angularjs'] },
    { name: 'Next.js', patterns: ['next/head', 'next/link', '__next'] },
    { name: 'Svelte', patterns: ['svelte', '__svelte'] },
    { name: 'Alpine.js', patterns: ['x-data', 'x-show', 'alpine'] },
    { name: 'HTMX', patterns: ['hx-', 'htmx'] },
    { name: 'Lit', patterns: ['lit-element', 'lit-html'] },
  ];

  for (const framework of frameworks) {
    if (framework.patterns.some(pattern => htmlLower.includes(pattern))) {
      if (!techStack.includes(framework.name)) {
        techStack.push(framework.name);
      }
    }
  }

  // CMS detection
  const cms = [
    { name: 'WordPress', patterns: ['wp-content', 'wp-includes', 'wordpress', 'wp-json'] },
    { name: 'Drupal', patterns: ['drupal', 'sites/default/files', 'drupal-settings'] },
    { name: 'Joomla', patterns: ['joomla', 'com_content', 'administrator/components'] },
    { name: 'Shopify', patterns: ['shopify', 'cdn.shopify.com', 'myshopify.com'] },
    { name: 'Wix', patterns: ['wix', 'static.wixstatic.com', 'wix-code'] },
    { name: 'Squarespace', patterns: ['squarespace', 'static1.squarespace.com'] },
    { name: 'Ghost', patterns: ['ghost', 'ghost-content-api', 'ghost-script'] },
    { name: 'HubSpot', patterns: ['hubspot', 'hs-scripts', 'hubspot.net'] },
    { name: 'Magento', patterns: ['mage/', 'magento', 'skin/frontend'] },
    { name: 'PrestaShop', patterns: ['prestashop', 'modules/', 'themes/'] },
  ];

  for (const cmsItem of cms) {
    if (cmsItem.patterns.some(pattern => htmlLower.includes(pattern))) {
      if (!techStack.includes(cmsItem.name)) {
        techStack.push(cmsItem.name);
      }
    }
  }

  // Hosting platforms
  if (server.includes('vercel') || headers.get('x-vercel-id')) {
    techStack.push('Vercel');
  }
  if (server.includes('netlify') || headers.get('x-nf-request-id')) {
    techStack.push('Netlify');
  }
  if (server.includes('heroku') || htmlLower.includes('herokuapp.com')) {
    techStack.push('Heroku');
  }
  if (htmlLower.includes('cloudfront.net')) {
    techStack.push('AWS CloudFront');
  }
  if (htmlLower.includes('azurewebsites.net') || htmlLower.includes('azure.net')) {
    techStack.push('Azure');
  }
  if (htmlLower.includes('firebaseapp.com')) {
    techStack.push('Firebase');
  }
  if (htmlLower.includes('github.io')) {
    techStack.push('GitHub Pages');
  }
  if (htmlLower.includes('netlify.app')) {
    techStack.push('Netlify');
  }

  // Analytics and tracking
  if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag(') || htmlLower.includes('UA-')) {
    techStack.push('Google Analytics');
  }
  if (htmlLower.includes('googletagmanager.com')) {
    techStack.push('Google Tag Manager');
  }
  if (htmlLower.includes('facebook.net') || htmlLower.includes('fbevents.js')) {
    techStack.push('Facebook Pixel');
  }
  if (htmlLower.includes('hotjar.com')) {
    techStack.push('Hotjar');
  }
  if (htmlLower.includes('segment.com') || htmlLower.includes('analytics.js')) {
    techStack.push('Segment');
  }
  if (htmlLower.includes('amplitude.com')) {
    techStack.push('Amplitude');
  }
  if (htmlLower.includes('mixpanel.com')) {
    techStack.push('Mixpanel');
  }

  // CDN detection
  if (htmlLower.includes('cdn.cloudflare.com') || htmlLower.includes('cdnjs.cloudflare.com')) {
    techStack.push('Cloudflare CDN');
  }
  if (htmlLower.includes('jsdelivr.net')) {
    techStack.push('jsDelivr');
  }
  if (htmlLower.includes('unpkg.com')) {
    techStack.push('unpkg');
  }
  if (htmlLower.includes('cdnjs.com')) {
    techStack.push('cdnjs');
  }

  // UI libraries
  if (htmlLower.includes('bootstrap')) techStack.push('Bootstrap');
  if (htmlLower.includes('tailwindcss')) techStack.push('Tailwind CSS');
  if (htmlLower.includes('bulma')) techStack.push('Bulma');
  if (htmlLower.includes('foundation')) techStack.push('Foundation');
  if (htmlLower.includes('materialize')) techStack.push('Materialize');
  if (htmlLower.includes('ant.design') || htmlLower.includes('antd')) techStack.push('Ant Design');
  if (htmlLower.includes('material-ui') || htmlLower.includes('@mui')) techStack.push('Material-UI');
  if (htmlLower.includes('chakra-ui')) techStack.push('Chakra UI');
  if (htmlLower.includes('shadcn')) techStack.push('shadcn/ui');
  if (htmlLower.includes('tailwindcss')) techStack.push('Tailwind CSS');

  // Payment gateways
  if (htmlLower.includes('stripe.com') || htmlLower.includes('js.stripe.com')) {
    techStack.push('Stripe');
  }
  if (htmlLower.includes('paypal.com')) {
    techStack.push('PayPal');
  }
  if (htmlLower.includes('braintreepayments.com')) {
    techStack.push('Braintree');
  }
  if (htmlLower.includes('squareup.com')) {
    techStack.push('Square');
  }

  // E-commerce
  if (htmlLower.includes('shopify')) techStack.push('Shopify');
  if (htmlLower.includes('woocommerce')) techStack.push('WooCommerce');
  if (htmlLower.includes('magento')) techStack.push('Magento');
  if (htmlLower.includes('bigcommerce')) techStack.push('BigCommerce');

  // Authentication
  if (htmlLower.includes('auth0.com') || htmlLower.includes('auth0')) {
    techStack.push('Auth0');
  }
  if (htmlLower.includes('firebaseauth')) {
    techStack.push('Firebase Auth');
  }
  if (htmlLower.includes('loginwithamazon')) {
    techStack.push('Amazon Cognito');
  }

  // JavaScript frameworks from meta tags
  const metaGenerator = htmlLower.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
  if (metaGenerator) {
    const generator = metaGenerator[1].toLowerCase();
    if (generator.includes('drupal')) techStack.push('Drupal');
    if (generator.includes('wordpress')) techStack.push('WordPress');
    if (generator.includes('joomla')) techStack.push('Joomla');
    if (generator.includes('wix')) techStack.push('Wix');
    if (generator.includes('squarespace')) techStack.push('Squarespace');
  }

  return [...new Set(techStack)]; // Remove duplicates
}

export async function lookupDNS(hostname: string): Promise<DNSRecords> {
  // Since we're in a Vercel environment, we'll use Google's DNS-over-HTTPS API
  const records: DNSRecords = {};

  try {
    // A records
    const aUrl = `https://dns.google/resolve?name=${hostname}&type=A`;
    const aResponse = await fetch(aUrl, { signal: AbortSignal.timeout(5000) });
    const aData = await aResponse.json();
    if (aData.Answer) {
      records.A = aData.Answer
        .filter((r: any) => r.type === 1)
        .map((r: any) => r.data);
    }

    // AAAA records
    const aaaaUrl = `https://dns.google/resolve?name=${hostname}&type=AAAA`;
    const aaaaResponse = await fetch(aaaaUrl, { signal: AbortSignal.timeout(5000) });
    const aaaaData = await aaaaResponse.json();
    if (aaaaData.Answer) {
      records.AAAA = aaaaData.Answer
        .filter((r: any) => r.type === 28)
        .map((r: any) => r.data);
    }

    // MX records
    const mxUrl = `https://dns.google/resolve?name=${hostname}&type=MX`;
    const mxResponse = await fetch(mxUrl, { signal: AbortSignal.timeout(5000) });
    const mxData = await mxResponse.json();
    if (mxData.Answer) {
      records.MX = mxData.Answer
        .filter((r: any) => r.type === 15)
        .map((r: any) => r.data);
    }

    // TXT records
    const txtUrl = `https://dns.google/resolve?name=${hostname}&type=TXT`;
    const txtResponse = await fetch(txtUrl, { signal: AbortSignal.timeout(5000) });
    const txtData = await txtResponse.json();
    if (txtData.Answer) {
      records.TXT = txtData.Answer
        .filter((r: any) => r.type === 16)
        .map((r: any) => r.data);
    }

    // NS records
    const nsUrl = `https://dns.google/resolve?name=${hostname}&type=NS`;
    const nsResponse = await fetch(nsUrl, { signal: AbortSignal.timeout(5000) });
    const nsData = await nsResponse.json();
    if (nsData.Answer) {
      records.NS = nsData.Answer
        .filter((r: any) => r.type === 2)
        .map((r: any) => r.data);
    }

    // CNAME records
    const cnameUrl = `https://dns.google/resolve?name=${hostname}&type=CNAME`;
    const cnameResponse = await fetch(cnameUrl, { signal: AbortSignal.timeout(5000) });
    const cnameData = await cnameResponse.json();
    if (cnameData.Answer) {
      records.CNAME = cnameData.Answer
        .filter((r: any) => r.type === 5)
        .map((r: any) => r.data);
    }
  } catch (error) {
    console.error('DNS lookup error:', error);
  }

  return records;
}

export async function getGeoLocation(ip: string): Promise<{ country: string; asn: string }> {
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,countryCode,as`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      return { country: 'Unknown', asn: 'Unknown' };
    }

    const data = await response.json();

    if (data.status === 'fail') {
      return { country: 'Unknown', asn: 'Unknown' };
    }

    return {
      country: data.countryCode || 'Unknown',
      asn: data.as || 'Unknown',
    };
  } catch (error) {
    console.error('Geo location error:', error);
    return { country: 'Unknown', asn: 'Unknown' };
  }
}

export function calculateRiskScore(
  subdomain: string,
  status: number | null,
  hasCloudflare: boolean,
  hasWAF: boolean,
  isAdminPortal: boolean
): number {
  let score = 0;

  // No protection
  if (!hasCloudflare && !hasWAF) {
    score += 30;
  }

  // Admin portals are higher risk
  if (isAdminPortal) {
    score += 40;
  }

  // Dead subdomains are lower risk
  if (status === null || status >= 400) {
    score -= 20;
  }

  // Risk keywords
  const riskKeywords = ['test', 'dev', 'staging', 'backup', 'old', 'temp'];
  if (riskKeywords.some((keyword) => subdomain.includes(keyword))) {
    score += 25;
  }

  return Math.max(0, Math.min(100, score));
}