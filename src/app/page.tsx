'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, ShieldCheck, Search, ArrowRight } from 'lucide-react';
import { useScan } from '@/hooks/use-scan';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { HomeScreen } from '@/components/mobile/HomeScreen';
import { ScanScreen } from '@/components/mobile/ScanScreen';
import { ResultsScreen } from '@/components/mobile/ResultsScreen';
import { HistoryScreen } from '@/components/mobile/HistoryScreen';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { useScanStore } from '@/store/scan-store';
import { SubdomainResult } from '@/types/scan';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [showScanInput, setShowScanInput] = useState(false);

  const { scanDomain, isScanning, progress, phase, error } = useScan();
  const {
    selectedSubdomain,
    setSelectedSubdomain,
    isDetailOpen,
    setIsDetailOpen,
    scanLogs,
    addToRecent,
    setScanLogs,
    addScanLog,
  } = useScanStore();

  const handleScanClick = () => {
    if (isScanning) {
      setActiveTab('scan');
    } else {
      setShowScanInput(true);
    }
  };

  const handleScanStart = async (domain: string) => {
    setShowScanInput(false);
    setActiveTab('scan');
    setScanLogs([]);
    addScanLog({
      timestamp: new Date().toISOString(),
      phase: 'enumeration',
      message: `Starting scan for ${domain}...`,
    });
    addToRecent(domain);
    await scanDomain(domain);
    setActiveTab('results');
  };

  const handleSubdomainSelect = (subdomain: SubdomainResult) => {
    setSelectedSubdomain(subdomain);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Tab Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-screen"
        >
          {activeTab === 'home' && <HomeScreen onScanClick={handleScanClick} />}
          {activeTab === 'scan' && (
            <ScanScreen
              isScanning={isScanning}
              progress={progress}
              phase={phase}
              logs={scanLogs.map((l) => l.message)}
              onCancel={() => setActiveTab('home')}
            />
          )}
          {activeTab === 'results' && <ResultsScreen onSubdomainSelect={handleSubdomainSelect} />}
          {activeTab === 'history' && <HistoryScreen />}
          {activeTab === 'settings' && <div className="h-full flex flex-col pb-24 p-4"><h1 className="text-white font-bold text-xl">Settings</h1><p className="text-gray-500 text-sm mt-2">Settings page coming soon</p></div>}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} onScanClick={handleScanClick} />

      {/* Bottom Sheet Details */}
      <BottomSheet subdomain={selectedSubdomain} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />

      {/* Command Palette */}
      <CommandPalette />

      {/* Scan Input Modal */}
      <AnimatePresence>
        {showScanInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
            onClick={() => setShowScanInput(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg mx-auto"
            >
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6" />
              <h2 className="text-white font-bold text-lg mb-4">Start Scan</h2>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter domain (e.g., webtoons.com)"
                  autoFocus
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-gray-600"
                />
              </div>

              <button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  if (input?.value) handleScanStart(input.value);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-medium active:scale-95 transition-transform"
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Scan
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}