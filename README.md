# Subdomain Intelligence Scanner v2.0 Pro

Advanced, production-ready cybersecurity tool for subdomain enumeration, Cloudflare detection, and security analysis. Built with Next.js 16, TypeScript, and modern web technologies.

## 🚀 Features

### Core Capabilities
- **Multi-Source Subdomain Enumeration**: Aggregates data from 6+ sources (crt.sh, AlienVault, Wayback Machine, etc.)
- **Cloudflare Detection**: Identifies Cloudflare protection via headers, IP ranges, and ASN
- **WAF Detection**: Detects Cloudflare, Akamai, AWS CloudFront, Fastly, Imperva, Sucuri, NGINX Proxy
- **Security Headers Analysis**: Analyzes CSP, HSTS, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, X-Content-Type-Options
- **SSL/TLS Intelligence**: Certificate issuer, expiration dates, TLS versions, cipher detection
- **Tech Stack Fingerprinting**: Detects 50+ technologies including frameworks, CMS, hosting platforms, analytics, payment gateways
- **Advanced Risk Analysis**: Calculates risk scores based on multiple factors (WAF, security headers, SSL, admin portals, etc.)

### Performance Features
- **Smart Caching**: 5-30 minute TTL cache for scan results
- **Promise Pool**: Parallel async scanning with concurrency control
- **AbortController**: Timeout management for long-running operations
- **Exponential Backoff**: Retry mechanism with exponential backoff
- **Debounced Search**: Optimized real-time search
- **Deduplication**: Automatic duplicate removal across sources

### Real-Time Experience
- **Live Progress Tracking**: Real-time progress with percentage and phases
- **Scan Activity Logs**: Timeline of all scan activities
- **Animated Progress Bars**: Smooth Framer Motion animations
- **Live Stats Updates**: Real-time statistics during scan

### UI/UX Features
- **Multiple View Modes**: List, Grid, and Table views
- **Command Palette**: Quick access with ⌘K (Cmd/Ctrl + K)
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Detail Drawer**: Expandable detail panel for each subdomain
- **Glassmorphism Design**: Premium dark theme with glass effects
- **Animated Backgrounds**: Floating particles and gradient blobs
- **Responsive Design**: Mobile-first, desktop optimized
- **Export Options**: JSON, CSV, TXT export

### Security Features
- **Cookie-based Authentication**: HttpOnly, Secure, SameSite=strict cookies
- **JWT Session Management**: Secure token-based sessions
- **Rate Limiting**: 15 requests per minute per session
- **Scan Cooldown**: 5 seconds between scans
- **Anti-Abuse Detection**: Fingerprinting and suspicious activity detection
- **Domain Validation**: Input validation and blocked domain list
- **API Security**: Protected endpoints with session verification

### Data Persistence
- **Favorites**: Save frequently scanned domains
- **Recent Scans**: Track scan history
- **LocalStorage**: Client-side persistence for favorites and history
- **PostgreSQL Ready**: Full Prisma schema for production database

## 🛠️ Tech Stack

### Framework & Language
- **Next.js 16** with App Router
- **TypeScript 5** with strict typing
- **Turbopack** for fast builds

### Styling & UI
- **TailwindCSS 4** with custom design system
- **shadcn/ui** component library (New York style)
- **Framer Motion** for animations
- **cmdk** for command palette

### State Management
- **Zustand** for global state
- **TanStack Query (React Query)** for server state
- **LocalStorage** for client persistence

### Backend
- **Serverless API Routes** (Vercel compatible)
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication (@jose/jose)

### Security
- **Cookie-based sessions** with HttpOnly and Secure flags
- **Rate limiting** with configurable limits
- **Anti-abuse** detection system
- **Domain validation** and blocking

## 📦 Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Generate session secret (required)
# Use a secure random string at least 32 characters long
```

### Environment Variables

```env
SESSION_SECRET=your-secure-random-secret-key-at-least-32-characters-long
DATABASE_URL=postgresql://user:password@localhost:5432/subdomain_scanner
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🏃 Running Locally

```bash
# Development server
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## 🗄️ Database Setup

### PostgreSQL Setup

```bash
# Run database migrations (if using Prisma)
bun run db:push

# Generate Prisma Client
bun run db:generate

# Open Prisma Studio
bun run db:studio
```

### Database Schema

The application includes a comprehensive Prisma schema with the following models:
- **User**: User accounts with subscription tiers
- **Session**: Secure session management
- **Scan**: Scan history with results
- **ScanResult**: Detailed scan results
- **Favorite**: Saved favorite domains
- **AbuseLog**: Abuse detection logs
- **APILog**: API usage analytics
- **Monitoring**: System monitoring data

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── scan/           # Scan endpoint with security
│   │   └── session/        # Session management
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── sitemap.ts          # SEO sitemap
│   └── robots.ts           # SEO robots.txt
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── ScanInput.tsx   # Hero input with animations
│   │   ├── StatsCards.tsx  # Animated stats cards
│   │   ├── SubdomainList.tsx # List view
│   │   ├── SubdomainGrid.tsx # Grid view
│   │   ├── SubdomainTable.tsx # Table view
│   │   ├── FilterBar.tsx   # Advanced filters
│   │   ├── ScanLogs.tsx    # Live scan logs
│   │   ├── CommandPalette.tsx # ⌘K command palette
│   │   ├── DetailDrawer.tsx # Detail panel
│   │   └── AnimatedBackground.tsx # Visual effects
│   ├── providers.tsx       # QueryClient provider
│   └── ui/                 # shadcn/ui components
├── hooks/
│   └── use-scan.ts         # Scan management hook
├── lib/
│   ├── session.ts          # JWT session utilities
│   ├── rate-limit.ts       # Rate limiting logic
│   ├── anti-abuse.ts       # Abuse detection
│   ├── cache.ts            # Smart caching system
│   └── promise-pool.ts     # Promise pool with concurrency
├── services/
│   ├── subdomain-sources.ts # Enumeration sources
│   ├── subdomain-enumerator.ts # Aggregator
│   ├── scanner.ts          # Detection logic
│   └── scan-service.ts     # Main scan orchestration
├── store/
│   └── scan-store.ts       # Zustand global state
├── types/
│   └── scan.ts             # TypeScript interfaces
└── db/                     # Prisma client
prisma/
└── schema.prisma           # Database schema
```

## 🔒 Security

### Session Management
- JWT-based secure sessions
- HttpOnly and Secure cookies
- SameSite=strict for CSRF protection
- 7-day session expiration
- Automatic session cleanup

### Rate Limiting
- 15 requests per minute per session
- 5-second cooldown between scans
- Configurable limits
- Automatic cleanup of expired entries

### Anti-Abuse
- Request fingerprinting
- Suspicious activity detection
- Temporary IP blocking
- Failed request tracking
- Bot protection

## 🚢 Deployment

### Vercel Deployment

1. **Push code to GitHub**
2. **Connect repository to Vercel**
3. **Configure environment variables** in Vercel dashboard:
   ```
   SESSION_SECRET=your-secure-random-secret-key
   DATABASE_URL=your-postgresql-connection-string
   NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
   ```
4. **Deploy** - Vercel will automatically build and deploy

### Environment-Specific Configuration

```bash
# Production
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Development
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📊 API Endpoints

### POST /api/session
Initialize a new secure session.

### GET /api/scan?domain={domain}
Scan a domain for subdomains and security information.

**Query Parameters:**
- `domain` (required): Domain to scan
- `includeDNS`: Include DNS analysis (default: true)
- `includeSSL`: Include SSL analysis (default: true)
- `includeHeaders`: Include security headers analysis (default: true)
- `maxSubdomains`: Maximum number of subdomains to scan (optional)

**Response:**
```json
{
  "success": true,
  "domain": "example.com",
  "subdomains": [...],
  "stats": {...},
  "timestamp": "2024-01-01T00:00:00Z",
  "duration": 5000,
  "logs": [...]
}
```

## 🎨 Customization

### Theme Colors

The application uses Tailwind CSS with a dark theme. Key colors:
- Background: `black`, `gray-900`
- Primary: `green-500` (success indicators)
- Secondary: `purple-500`, `blue-500` (accents)
- Danger: `red-500` (errors, high risk)
- Warning: `yellow-500`, `orange-500` (warnings, medium risk)

### Animation Speeds

Framer Motion animations are configured with:
- Page transitions: 0.5s
- Card animations: 0.3s
- Hover effects: 0.2s
- Loading animations: Variable

## 📈 Performance

### Optimization Techniques
1. **Smart Caching**: 5-30 minute TTL for repeated scans
2. **Parallel Processing**: Concurrent HTTP requests with configurable limit
3. **Debouncing**: Search input debouncing to reduce API calls
4. **Code Splitting**: Next.js automatic code splitting
5. **Lazy Loading**: Components loaded on demand

### Benchmarks
- Average scan time: 30-120 seconds (depending on subdomain count)
- Cache hit response: < 100ms
- Parallel requests: Up to 20 concurrent
- Memory usage: Optimized for serverless environment

## 🔍 Tech Stack Detection

The scanner detects 50+ technologies across categories:
- **Frontend**: React, Vue, Angular, Next.js, Nuxt, Svelte, Alpine.js, HTMX
- **Backend**: Express, Laravel, Django, Flask, Ruby on Rails, ASP.NET
- **CMS**: WordPress, Drupal, Joomla, Ghost, HubSpot
- **Hosting**: Vercel, Netlify, Heroku, AWS CloudFront, Azure, Firebase
- **Analytics**: Google Analytics, Google Tag Manager, Facebook Pixel, Hotjar
- **Payment**: Stripe, PayPal, Braintree, Square
- **Security**: Cloudflare, Akamai, Auth0

## 🎯 Risk Analysis

### Risk Score Calculation (0-100)

**Positive Risk Factors:**
- No Cloudflare protection: +25
- No WAF detected: +25
- Admin/portal keywords: +35
- Test/dev/staging keywords: +20
- Missing security headers: +5 each
- SSL issues: +15-30
- Slow response time: +5

**Risk Levels:**
- **Low (0-24)**: Generally secure
- **Medium (25-49)**: Some concerns
- **High (50-74)**: Significant risks
- **Critical (75-100)**: Immediate attention required

## 📝 License

This project is proprietary. All rights reserved.

## 🤝 Support

For support and inquiries, contact the security team.

---

**Built with ❤️ using Next.js 16, TypeScript, and modern web technologies**