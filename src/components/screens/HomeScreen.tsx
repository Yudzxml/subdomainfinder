'use client';

import { motion } from 'framer-motion';
import {
  Search, Globe, Activity, ShieldCheck, AlertTriangle, Clock3, Zap,
  Radar, ListChecks, Star, ArrowRight, Database, Cpu,
} from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { SectionHeading, FloatingOrb } from '@/components/scan/AnimatedBackground';

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function HomeScreen() {
  const stats = useScanStore((s) => s.stats);
  const recentScans = useScanStore((s) => s.recentScans);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const setScanModalOpen = useScanStore((s) => s.setScanModalOpen);
  const setActiveTab = useScanStore((s) => s.setActiveTab);
  const setCommandPaletteOpen = useScanStore((s) => s.setCommandPaletteOpen);
  const isScanning = useScanStore((s) => s.isScanning);

  const statCards = stats
    ? [
        { label: 'Total Found', value: stats.total, icon: Globe, cls: 'text-cyan-300', ring: 'ring-cyan-500/25', bg: 'bg-cyan-500/10' },
        { label: 'Alive', value: stats.alive, icon: Activity, cls: 'text-emerald-300', ring: 'ring-emerald-500/25', bg: 'bg-emerald-500/10' },
        { label: 'Protected', value: stats.protected, icon: ShieldCheck, cls: 'text-violet-300', ring: 'ring-violet-500/25', bg: 'bg-violet-500/10' },
        { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, cls: 'text-red-300', ring: 'ring-red-500/25', bg: 'bg-red-500/10' },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <FloatingOrb className="-right-10 -top-10 h-44 w-44 bg-emerald-500/15" duration={9} />
        <FloatingOrb className="-bottom-14 right-24 h-36 w-36 bg-cyan-500/10" delay={1.2} duration={11} />
        <FloatingOrb className="-left-8 top-8 h-28 w-28 bg-violet-500/10" delay={2} duration={10} />

        <motion.div variants={item} className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/25">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            6 reconnaissance sources online
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            Discover every <span className="text-gradient">subdomain</span>
            <br className="hidden sm:block" /> before attackers do.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Multi-source enumeration, Cloudflare &amp; WAF detection, SSL intelligence,
            security headers, and risk scoring — wrapped in one fast, clean dashboard.
          </p>
        </motion.div>

        {/* Search card */}
        <motion.button
          variants={item}
          whileHover={{ scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setScanModalOpen(true)}
          className="group relative mt-6 flex w-full items-center gap-4 rounded-2xl border border-border bg-black/30 p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-black/40 sm:p-5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-emerald-500/30 sm:h-14 sm:w-14">
            <Search className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {isScanning ? 'Scan in progress…' : 'Enter a domain to scan'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              or press <kbd className="rounded border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> anywhere
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-emerald-400" />
        </motion.button>
      </section>

      {/* Latest stats */}
      {stats && (
        <motion.section variants={item}>
          <SectionHeading
            title="Latest scan results"
            action={
              <button
                onClick={() => setActiveTab('results')}
                className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -3 }}
                className={`glass rounded-2xl p-4 ring-1 ${stat.ring} sm:p-5`}
              >
                <div className={`mb-3 inline-flex rounded-xl p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.cls}`} />
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quick actions */}
      <motion.section variants={item}>
        <SectionHeading title="Quick actions" />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'New Scan',
              desc: 'Launch full enumeration',
              icon: Zap,
              onClick: () => setScanModalOpen(true),
            },
            {
              label: 'View Results',
              desc: 'Browse last findings',
              icon: ListChecks,
              onClick: () => setActiveTab('results'),
            },
            {
              label: 'Command Palette',
              desc: 'Fast keyboard workflow',
              icon: Radar,
              onClick: () => setCommandPaletteOpen(true),
            },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="glass group flex items-center gap-3.5 rounded-2xl p-4 text-left transition-colors hover:border-emerald-500/30 sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-emerald-500/15 group-hover:ring-emerald-500/30">
                <action.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Recent scans */}
      <motion.section variants={item}>
        <SectionHeading
          title="Recent scans"
          action={
            recentScans.length > 0 ? (
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                History <ArrowRight className="h-3 w-3" />
              </button>
            ) : undefined
          }
        />
        <div className="glass mt-3 overflow-hidden rounded-2xl">
          {recentScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                <Clock3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No scans yet</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Your scan history will appear here. Start by scanning your first domain.
              </p>
              <button
                onClick={() => setScanModalOpen(true)}
                className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
              >
                Scan a domain
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentScans.slice(0, 4).map((entry, i) => (
                <motion.li
                  key={entry.domain}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 ring-1 ring-white/10">
                      {favoriteDomains.includes(entry.domain) ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium text-foreground">
                        {entry.domain}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelative(entry.scannedAt)}
                        {entry.totalFound > 0 && ` · ${entry.totalFound} found`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setScanModalOpen(true)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-emerald-400"
                    aria-label={`Scan ${entry.domain} again`}
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.section>

      {/* Feature strip */}
      <motion.section variants={item}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Database,
              title: '6 data sources',
              desc: 'crt.sh, AlienVault, BufferOver, HackerTarget, RapidDNS & Wayback',
            },
            {
              icon: Cpu,
              title: 'Deep analysis',
              desc: 'WAF, SSL, security headers, tech stack & risk scoring per host',
            },
          ].map((f) => (
            <div key={f.title} className="glass flex items-start gap-3.5 rounded-2xl p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/25">
                <f.icon className="h-[18px] w-[18px] text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
