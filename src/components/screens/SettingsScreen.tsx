'use client';

import { motion } from 'framer-motion';
import {
  Trash2, Download, ShieldCheck, Info, Github, LogOut, Database, Keyboard,
} from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { SectionHeading } from '@/components/scan/AnimatedBackground';
import { useState } from 'react';

export function SettingsScreen() {
  const recentScans = useScanStore((s) => s.recentScans);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const clearAllData = useScanStore((s) => s.clearAllData);
  const exportData = useScanStore((s) => s.exportData);
  const filteredSubdomains = useScanStore((s) => s.filteredSubdomains);
  const { refreshSession, token } = useSession();
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  const hasData = recentScans.length > 0 || favoriteDomains.length > 0;

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearAllData();
    setConfirmClear(false);
    toast({ title: 'All local data cleared' });
  };

  const handleExportHistory = () => {
    if (filteredSubdomains.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'Run a scan first, then export the results.',
      });
      return;
    }
    exportData('json');
    toast({ title: 'Export started', description: 'Downloading current results as JSON' });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground sm:text-xl">Settings</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Manage preferences, data, and session
        </p>
      </div>

      {/* Session status */}
      <section>
        <SectionHeading title="Session" />
        <div className="glass mt-3 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/25">
                <ShieldCheck className="h-[18px] w-[18px] text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {token ? 'Active' : 'Not initialized'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  JWT session · HttpOnly cookie · 7-day expiry
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await refreshSession();
                toast({ title: 'Session refreshed' });
              }}
              className="glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-foreground transition-colors hover:border-emerald-500/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              Refresh
            </motion.button>
          </div>
          {token && (
            <p className="mt-3 truncate rounded-lg bg-black/30 px-3 py-2 font-mono text-[10px] text-muted-foreground">
              {token.slice(0, 42)}…
            </p>
          )}
        </div>
      </section>

      {/* Data management */}
      <section>
        <SectionHeading title="Data" />
        <div className="glass mt-3 divide-y divide-border overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Database className="h-[18px] w-[18px] text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Local storage</p>
                <p className="text-[11px] text-muted-foreground">
                  {recentScans.length} recent scans · {favoriteDomains.length} favorites
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportHistory}
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/[0.03] sm:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Download className="h-[18px] w-[18px] text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Export scan results</p>
                <p className="text-[11px] text-muted-foreground">Download current results as JSON</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleClearAll}
            className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors sm:p-5 ${
              confirmClear ? 'bg-red-500/[0.08]' : 'hover:bg-red-500/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/25">
                <Trash2 className="h-[18px] w-[18px] text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {confirmClear ? 'Tap again to confirm' : 'Clear all local data'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {confirmClear
                    ? 'This will remove history and favorites'
                    : hasData
                      ? 'Remove history and favorites permanently'
                      : 'Nothing stored yet'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section>
        <SectionHeading title="Keyboard" />
        <div className="glass mt-3 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <Keyboard className="h-[18px] w-[18px] text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <kbd className="rounded-md border border-border bg-white/5 px-2 py-1 font-mono text-[10px] text-foreground">
                  ⌘K
                </kbd>
                Command palette
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded-md border border-border bg-white/5 px-2 py-1 font-mono text-[10px] text-foreground">
                  Enter
                </kbd>
                Quick scan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <SectionHeading title="About" />
        <div className="glass mt-3 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 ring-1 ring-white/10">
              <Info className="h-[18px] w-[18px] text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">SubScan v2.1</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Subdomain intelligence scanner that aggregates crt.sh, AlienVault,
                BufferOver, HackerTarget, RapidDNS, and Wayback Machine — then enriches
                every host with WAF, SSL, header, and risk analysis.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Next.js 16', 'TypeScript', 'Framer Motion', 'Tailwind 4'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href="https://github.com/Yudzxml/subdomainfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                <Github className="h-3.5 w-3.5" />
                Source on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible use */}
      <section className="glass rounded-2xl border-amber-500/20 bg-amber-500/[0.04] p-4 sm:p-5">
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          This tool queries public passive-reconnaissance sources only. It never performs
          intrusive testing. Use responsibly and only against assets you are authorized to
          assess.
        </p>
      </section>
    </div>
  );
}
