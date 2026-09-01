'use client';

import { motion } from 'framer-motion';
import { Radar, ListChecks, History, Settings, Home, Zap } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useScan } from '@/hooks/use-scan';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'results', label: 'Results', icon: ListChecks },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function DesktopSidebar() {
  const activeTab = useScanStore((s) => s.activeTab);
  const setActiveTab = useScanStore((s) => s.setActiveTab);
  const setScanModalOpen = useScanStore((s) => s.setScanModalOpen);
  const { isScanning } = useScan();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-[oklch(0.15_0.01_260)]/60 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-400 shadow-lg shadow-emerald-500/20">
          <Radar className="h-5 w-5 text-black/80" />
          {isScanning && (
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-emerald-400/60"
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-foreground">SubScan</p>
          <p className="text-[11px] text-muted-foreground">Intelligence Scanner</p>
        </div>
      </div>

      {/* Scan CTA */}
      <div className="px-4 pb-4">
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setScanModalOpen(true)}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-shadow hover:shadow-emerald-500/30"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Zap className="h-4 w-4" />
          New Scan
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white/[0.07] border border-white/10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <item.icon
                className={`relative z-10 h-[18px] w-[18px] ${
                  isActive ? 'text-emerald-400' : ''
                }`}
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {isScanning ? 'Scanner active' : 'System ready'}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          v2.1 — built by Yudzxml
        </p>
      </div>
    </aside>
  );
}
