'use client';

import { motion } from 'framer-motion';
import { Search, Radar } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useScan } from '@/hooks/use-scan';

export function TopBar() {
  const setCommandPaletteOpen = useScanStore((s) => s.setCommandPaletteOpen);
  const { isScanning } = useScan();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl pt-safe">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-400">
            <Radar className="h-[18px] w-[18px] text-black/80" />
            {isScanning && (
              <motion.span
                className="absolute inset-0 rounded-xl border-2 border-emerald-400/60"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-[15px] font-bold tracking-tight">SubScan</span>
        </div>

        {/* Desktop page context */}
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-foreground">Subdomain Intelligence</p>
          <p className="text-xs text-muted-foreground">
            Enumerate • Analyze • Secure
          </p>
        </div>

        {/* Command palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="glass flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:w-64 sm:justify-start"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search domain…</span>
          <kbd className="ml-auto hidden rounded-md border border-border bg-white/5 px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
