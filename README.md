# SubScan — Subdomain Intelligence Scanner

Advanced, production-ready cybersecurity tool for **subdomain enumeration**, **Cloudflare/WAF detection**, and **security analysis**. Built with Next.js 16, TypeScript 5, Tailwind CSS 4, and Framer Motion.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/TypeScript-5-blue) ![Tech](https://img.shields.io/badge/TailwindCSS-4-cyan) ![Tech](https://img.shields.io/badge/Framer_Motion-12-pink) ![Tech](https://img.shields.io/badge/React-19-61dafb) ![License](https://img.shields.io/badge/License-MIT-green)

> **v2.1.0** — Complete redesign: professional UI/UX, fixed features, cleaned codebase.

## 👤 Author

**Yudzxml** — [yudaaryaardhana1122@gmail.com](mailto:yudaaryaardhana1122@gmail.com)

- GitHub: [@Yudzxml](https://github.com/Yudzxml)
- Repository: [subdomainfinder](https://github.com/Yudzxml/subdomainfinder)

## ✨ Features

### Core Capabilities
- **Multi-source passive enumeration** — aggregates subdomains from 6 sources: crt.sh (certificate transparency logs), AlienVault OTX (passive DNS), BufferOver, HackerTarget, RapidDNS, and the Wayback Machine (CDX archive)
- **Cloudflare detection** — correlates 5 indicators: `Server` header, `CF-Ray`, `CF-Cache-Status`, Cloudflare IP ranges, and ASN
- **WAF detection** — identifies Cloudflare, Akamai, AWS CloudFront, Fastly, Imperva, Sucuri, and NGINX Proxy from response headers
- **DNS records lookup** — A, AAAA, MX, TXT, NS, and CNAME resolution via Google DNS-over-HTTPS
- **Geo/IP intelligence** — country and ASN lookup per subdomain, with dedicated 30-minute caching
- **Security headers analysis** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, and more
- **SSL/TLS intelligence** — active status, issuer, expiry, validity, warnings
- **Tech stack fingerprinting** — built-in signatures for 8 JS frameworks (React, Vue.js, Angular, Next.js, Svelte, Alpine.js, HTMX, Lit) and 10 CMS/platforms (WordPress, Drupal, Joomla, Shopify, Wix, Squarespace, Ghost, HubSpot, Magento, PrestaShop), plus `<meta name="generator">` detection
- **Page title extraction** — from `<title>` or `<h1>` fallback
- **Risk scoring (0–100)** — weighted factors including WAF absence, admin portals, dev/staging/backup keywords (`test`, `dev`, `staging`, `backup`, `old`, `temp`), missing security headers, and SSL issues

### Performance
- Three-tier TTL caching — scan results (5 min), DNS records (10 min), geo data (30 min) — with automatic cleanup every 5 minutes
- Custom promise pool with bounded concurrency (20 parallel probes), configurable timeouts, and retry with exponential backoff
- Per-request `AbortSignal.timeout` guards on every upstream source (15–20s)
- Smooth client-side progress simulation with phase tracking during long scans
- Scan endpoint `maxDuration` of 300s for long-running enumerations

### UI/UX
- **Fully responsive** — dedicated mobile screen set (home, scan, results, history) with bottom navigation, bottom sheets, and FAB; desktop sidebar layout with adaptive grids
- **Live radar scan animation** with phase tracking and real-time activity log
- **Command palette (⌘K / Ctrl+K)** — scan any domain instantly, manage favorites
- **List & grid result views**, debounced search, advanced filter sheet (status, WAF, risk level, SSL, admin portals)
- **Detail sheet** per subdomain — IP, server, ASN, tech stack, SSL details, security headers, DNS records
- **Export** results as JSON, CSV, or TXT
- **Scan history & favorites** persisted to `localStorage` via Zustand
- Toast notifications, skeleton-free progressive loading, reduced-motion support

### Security
- JWT sessions (`jose`, HS256) with HttpOnly + `SameSite=Lax` cookies, 7-day expiry, and sliding activity refresh
- `X-Session-Token` header fallback for restricted cookie environments
- Rate limiting (15 req/min) and 5s scan cooldown per session
- Anti-abuse fingerprinting (SHA-256 of UA + language + encoding) with temporary blocking after 20 suspicious requests in 5 minutes
- Domain validation (TLD required) + blocked-domain list
- Passive sources only — the scanner never performs intrusive testing

## 🚀 Getting Started

**Prerequisites:** [Bun](https://bun.sh) 1.1+ (or Node.js 20+ with pnpm/npm)

```bash
# 1. Clone the repository
git clone https://github.com/Yudzxml/subdomainfinder.git
cd subdomainfinder

# 2. Install dependencies
bun install

# 3. Run the dev server
bun run dev

# 4. Open http://localhost:3000
```

### Production Build

```bash
bun run build   # standalone output (.next/standalone)
bun run start   # serves the standalone server
```

### Environment Variables

```env
SESSION_SECRET=change-me-to-a-secure-random-string-min-32-chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> `SESSION_SECRET` is required in production — sessions fall back to a development key otherwise.

### Reverse Proxy (optional)

A `Caddyfile` is included for Caddy-based deployments: it proxies `:81` → `localhost:3000` and supports port-transform queries (`?XTransformPort=`) for multi-app hosts.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scan/route.ts        # Scan endpoint (session + abuse checks + cache)
│   │   └── session/route.ts     # Session bootstrap
│   ├── layout.tsx               # Metadata, fonts, providers
│   ├── page.tsx                 # App shell entry
│   ├── icon.svg                 # Favicon
│   ├── globals.css              # Design system (dark, glassmorphism)
│   └── sitemap.ts / robots.ts   # SEO
├── components/
│   ├── layout/                  # AppShell, DesktopSidebar, BottomNav, TopBar
│   ├── screens/                 # Home, Scan, Results, History, Settings (desktop)
│   ├── mobile/                  # HomeScreen, ScanScreen, ResultsScreen,
│   │                            #   HistoryScreen, MobileNavigation, BottomSheet
│   ├── scan/                    # ScanModal, SubdomainCard, DetailSheet, FilterSheet
│   ├── dashboard/               # CommandPalette (⌘K)
│   └── ui/                      # Minimal shadcn/ui primitives (Radix-based)
├── hooks/                       # use-scan (progress + abort), use-session, use-toast
├── store/                       # Zustand store (scan state, filters, persistence)
├── services/                    # Enumeration sources, scanner, scan orchestration
├── lib/                         # session, cache, rate-limit, anti-abuse, promise-pool
└── types/                       # Shared TypeScript types
```

## 📡 API

### `POST /api/session`
Creates a JWT session (HS256) and sets an HttpOnly cookie. Sessions track `scanCount` and sliding activity, expiring after 7 days.

### `GET /api/scan?domain=example.com`
Runs a full scan. Optional params: `includeDNS`, `includeSSL`, `includeHeaders`, `maxSubdomains`, `forceRefresh`. Also available via `POST`. Requires a valid session (cookie or `X-Session-Token` header).

```json
{
  "success": true,
  "domain": "example.com",
  "subdomains": [...],
  "stats": { "total": 42, "alive": 30, "protected": 12, "sslValid": 28, "sslExpired": 2, "sslWeak": 0 },
  "duration": 5230,
  "cached": false,
  "scanId": "uuid",
  "logs": [...]
}
```

Response codes: `200` success · `400` invalid/missing domain · `401` missing/invalid session · `403` blocked domain · `429` rate-limited or cooldown · `500` scan failure.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, Radix UI, shadcn/ui primitives, Lucide icons |
| Styling | Tailwind CSS 4, tw-animate-css |
| Motion | Framer Motion 12 |
| State | Zustand 5 (persisted) |
| Auth | jose (JWT HS256) |
| Command palette | cmdk |
| Runtime | Bun |

## 🎨 Design System

- **Palette** — near-black base (`oklch 0.13`, theme color `#0c0f14`), emerald primary, cyan/violet accents
- **Surfaces** — glassmorphism cards with 1px inner borders and soft glow orbs
- **Type** — Geist Sans / Geist Mono
- **Radius** — consistent `1rem` base scale
- **Motion** — springy tab transitions, staggered card reveals, drifting orbs

## 🔒 Risk Levels

| Score | Level | Meaning |
|-------|-------|---------|
| 0–24 | 🟢 Low | Generally secure |
| 25–49 | 🟡 Medium | Some concerns |
| 50–74 | 🟠 High | Significant risks |
| 75–100 | 🔴 Critical | Immediate attention |

## ⚠️ Disclaimer

This tool performs **passive enumeration only** using public data sources. Scan only domains you own or have explicit permission to test. The author is not responsible for misuse.

## 📄 License

MIT — see the repository. © 2026 Yudzxml
