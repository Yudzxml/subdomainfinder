'use client';

import { motion } from 'framer-motion';
import { Home, Radar, List, History, Settings as SettingsIcon, Scan } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onScanClick: () => void;
}

export function MobileNavigation({ activeTab, onTabChange, onScanClick }: MobileNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scan', icon: Radar, label: 'Scan' },
    // Spacer for FAB
    { id: 'results', icon: List, label: 'Results' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-black/90 backdrop-blur-xl border-t border-gray-800/50 pb-safe">
      {/* Floating Action Button (FAB) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
        <motion.button
          onClick={onScanClick}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/40 flex items-center justify-center border-4 border-black ring-2 ring-purple-500/30"
        >
          <Scan className="w-7 h-7 text-white" />
        </motion.button>
      </div>

      <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-16 h-full relative group"
            >
              {/* Glow indicator for active tab */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-10 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-500/50"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Active background glow */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
                />
              )}

              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative z-10"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg'
                      : 'text-gray-500 group-hover:text-gray-400'
                  }`}
                />
              </motion.div>

              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}