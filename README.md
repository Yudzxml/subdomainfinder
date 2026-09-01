# SubScan — Subdomain Intelligence Scanner

Advanced, production-ready cybersecurity tool for **subdomain enumeration**, **Cloudflare/WAF detection**, and **security analysis**. Built with Next.js 16, TypeScript 5, Tailwind CSS 4, and Framer Motion.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/TypeScript-5-blue) ![Tech](https://img.shields.io/badge/TailwindCSS-4-cyan) ![Tech](https://img.shields.io/badge/Framer_Motion-12-pink)

## ✨ Features

### Core Capabilities
- **Multi-source enumeration** — aggregates subdomains from 6 passive sources: crt.sh, AlienVault, BufferOver, HackerTarget, RapidDNS, and Wayback Machine
- **Cloudflare detection** — headers, IP-range, and ASN correlation
- **WAF detection** — Cloudflare, Akamai, AWS CloudFront, Fastly, Imperva, Sucuri, NGINX Proxy
- **Security headers analysis** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, and more
- **SSL/TLS intelligence** — issuer, expiry, TLS version, cipher, warnings
- **Tech stack fingerprinting** — 50+ technologies across frameworks, CMS, hosting, analytics, and payments
- **Risk scoring (0–100)** — weighted factors including WAF absence, admin portals, dev/staging keywords, missing headers, and SSL issues

### Performance
- Smart TTL caching (5–30 min) for repeat scans
- Promise pool with bounded concurrency (20 parallel probes)
- Timeout management + exponential backoff retries
- Smooth client-side progress simulation during long scans

### UI/UX
- **Fully responsive** — mobile bottom navigation with FAB, desktop sidebar layout, adaptive grids and spacing
- **Live radar scan animation** with phase tracking and real-time activity log
- **Command palette (⌘K / Ctrl+K)** — scan any domain instantly, manage favorites
- **List & grid result views**, debounced search, advanced filter sheet (status, WAF, risk level, SSL, admin portals)
- **Detail sheet** per subdomain — IP, server, ASN, tech stack, SSL details, security headers
- **Export** results as JSON, CSV, or TXT
- **Scan history & favorites** persisted to localStorage with real timestamps
- Toast notifications, skeleton-free progressive loading, reduced-motion support

### Security
- JWT sessions (`jose`) with HttpOnly + SameSite cookies, 7-day expiry
- Rate limiting (15 req/min) and 5s scan cooldown per session
- Anti-abuse fingerprinting and temporary blocking
- Domain validation + blocked-domain list
- Passive sources only — the scanner never performs intrusive testing

## 🚀 Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Run the dev server
bun run dev

# 3. Open http://localhost:3000
```

### Environment Variables

```env
SESSION_SECRET=change-me-to-a-secure-random-string-min-32-chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> `SESSION_SECRET` is required in production — sessions fall back to a development key otherwise.

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
│   ├── sitemap.ts / robots.ts   # SEO
├── components/
│   ├── layout/                  # AppShell, DesktopSidebar, BottomNav, TopBar
│   ├── screens/                 # Home, Scan, Results, History, Settings
│   ├── scan/                    # ScanModal, SubdomainCard, DetailSheet, FilterSheet
│   ├── dashboard/               # CommandPalette (⌘K)
│   └── ui/                      # Minimal shadcn/ui primitives
├── hooks/                       # use-scan (progress + abort), use-session
├── store/                       # Zustand store (scan state, filters, persistence)
├── services/                    # Enumeration sources, scanner, orchestration
├── lib/                         # session, cache, rate-limit, anti-abuse, promise-pool
└── types/                       # Shared TypeScript types
```

## 📡 API

### `POST /api/session`
Creates a JWT session and sets an HttpOnly cookie.

### `GET /api/scan?domain=example.com`
Runs a full scan. Optional params: `includeDNS`, `includeSSL`, `includeHeaders`, `maxSubdomains`, `forceRefresh`.

```json
{
  "success": true,
  "domain": "example.com",
  "subdomains": [...],
  "stats": { "total": 42, "alive": 30, "protected": 12, ... },
  "duration": 5230,
  "cached": false
}
```

## 🎨 Design System

- **Palette** — near-black base (`oklch 0.13`), emerald primary, cyan/violet accents
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

## 📄 License

MIT
