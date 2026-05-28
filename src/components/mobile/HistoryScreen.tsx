'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, Heart, Trash2 } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useState } from 'react';

export function HistoryScreen() {
  const recentScans = useScanStore((state) => state.recentScans);
  const favoriteDomains = useScanStore((state) => state.favoriteDomains);
  const removeFromFavorites = useScanStore((state) => state.removeFromFavorites);
  const clearRecent = useScanStore((state) => state.clearRecent);

  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');

  return (
    <div className="h-full flex flex-col pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <h1 className="text-white font-bold text-xl">History</h1>
        <button
          onClick={clearRecent}
          className="p-2 rounded-xl bg-red-500/20 border border-red-500/30"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/50 text-gray-400'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800/50 text-gray-400'
          }`}
        >
          Favorites
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {activeTab === 'recent' ? (
          <>
            {recentScans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">No recent scans</p>
                <p className="text-gray-600 text-sm mt-1">Start scanning to see history</p>
              </motion.div>
            ) : (
              recentScans.map((domain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{domain}</p>
                      <p className="text-xs text-gray-500">2h ago</p>
                    </div>
                  </div>
                  <button className="text-gray-500">
                    <Zap className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </>
        ) : (
          <>
            {favoriteDomains.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">No favorites yet</p>
                <p className="text-gray-600 text-sm mt-1">Add domains to favorites</p>
              </motion.div>
            ) : (
              favoriteDomains.map((domain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-purple-400 fill-purple-400" />
                    </div>
                    <p className="text-white font-medium">{domain}</p>
                  </div>
                  <button
                    onClick={() => removeFromFavorites(domain)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </>
        )}

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}