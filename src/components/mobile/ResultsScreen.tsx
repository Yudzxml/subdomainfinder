'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MobileSubdomainCard } from './MobileSubdomainCard';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';
import { BottomSheet } from './BottomSheet';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface ResultsScreenProps {
  onSubdomainSelect: (subdomain: SubdomainResult) => void;
}

export function ResultsScreen({ onSubdomainSelect }: ResultsScreenProps) {
  const filteredSubdomains = useScanStore((state) => state.filteredSubdomains);
  const selectedSubdomain = useScanStore((state) => state.selectedSubdomain);
  const setSelectedSubdomain = useScanStore((state) => state.setSelectedSubdomain);
  const stats = useScanStore((state) => state.stats);

  return (
    <div className="h-full flex flex-col pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <h1 className="text-white font-bold text-xl">Results</h1>
        <button className="p-2 rounded-xl bg-gray-800/50">
          <Filter className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide"
        >
          <div className="flex-shrink-0 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-2xl">
            <p className="text-blue-400 text-lg font-bold">{stats.total}</p>
            <p className="text-blue-300/60 text-xs">Total</p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-2xl">
            <p className="text-green-400 text-lg font-bold">{stats.alive}</p>
            <p className="text-green-300/60 text-xs">Alive</p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-2xl">
            <p className="text-purple-400 text-lg font-bold">{stats.protected}</p>
            <p className="text-purple-300/60 text-xs">Protected</p>
          </div>
        </motion.div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        <AnimatePresence>
          {filteredSubdomains.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500">No results found</p>
              <p className="text-gray-600 text-sm mt-1">Start a scan to see results</p>
            </motion.div>
          ) : (
            filteredSubdomains.map((subdomain, index) => (
              <MobileSubdomainCard
                key={subdomain.subdomain}
                subdomain={subdomain}
                index={index}
                onSelect={(s) => {
                  setSelectedSubdomain(s);
                  onSubdomainSelect(s);
                }}
              />
            ))
          )}
        </AnimatePresence>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}