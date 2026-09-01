'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useScanStore } from '@/store/scan-store';
import { useSession } from '@/hooks/use-session';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ScanScreen } from '@/components/screens/ScanScreen';
import { ResultsScreen } from '@/components/screens/ResultsScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { ScanModal } from '@/components/scan/ScanModal';
import { DetailSheet } from '@/components/scan/DetailSheet';
import { FilterSheet } from '@/components/scan/FilterSheet';
import { CommandPalette } from '@/components/dashboard/CommandPalette';

const screenVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

export function AppShell() {
  const activeTab = useScanStore((s) => s.activeTab);
  // Initialize the secure session once on app load
  useSession();

  // Lock body scroll when any overlay is open
  const anyOverlay = useScanStore((s) => s.isScanModalOpen || s.isDetailOpen || s.isFilterOpen || s.isCommandPaletteOpen);
  useEffect(() => {
    if (!anyOverlay) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [anyOverlay]);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] rounded-full bg-violet-500/[0.05] blur-[120px]" />
        <div className="absolute left-0 top-1/3 h-[300px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[110px]" />
      </div>

      <DesktopSidebar />

      <div className="relative lg:pl-64">
        <TopBar />

        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {activeTab === 'home' && <HomeScreen />}
              {activeTab === 'scan' && <ScanScreen />}
              {activeTab === 'results' && <ResultsScreen />}
              {activeTab === 'history' && <HistoryScreen />}
              {activeTab === 'settings' && <SettingsScreen />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav />

      {/* Overlays */}
      <ScanModal />
      <DetailSheet />
      <FilterSheet />
      <CommandPalette />
    </div>
  );
}
