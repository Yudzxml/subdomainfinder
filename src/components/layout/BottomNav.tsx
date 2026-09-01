'use client';

import { motion } from 'framer-motion';
import { Home, ListChecks, History, Settings, Radar } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'results', label: 'Results', icon: ListChecks },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function BottomNav() {
  const activeTab = useScanStore((s) => s.activeTab);
  const setActiveTab = useScanStore((s) => s.setActiveTab);
  const setScanModalOpen = useScanStore((s) => s.setScanModalOpen);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* FAB */}
      <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2">
        <motion.button
          onClick={() => setScanModalOpen(true)}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          aria-label="Start new scan"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-400 shadow-xl shadow-emerald-500/30"
        >
          <Radar className="h-7 w-7 text-black/80" />
        </motion.button>
      </div>

      {/* Bar */}
      <nav
        aria-label="Primary"
        className="glass-strong border-t border-border pb-safe"
      >
        <div className="mx-auto grid h-20 max-w-lg grid-cols-4 items-center px-2 pt-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex flex-col items-center justify-center gap-1 py-1"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute -top-1 h-1 w-9 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <tab.icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      isActive
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
