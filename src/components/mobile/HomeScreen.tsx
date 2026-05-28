'use client';

import { motion } from 'framer-motion';
import { Search, TrendingUp, ShieldCheck, AlertTriangle, Clock, Zap, Globe, Activity } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';

interface HomeScreenProps {
  onScanClick: () => void;
}

export function HomeScreen({ onScanClick }: HomeScreenProps) {
  const stats = useScanStore((state) => state.stats);
  const recentScans = useScanStore((state) => state.recentScans);

  return (
    <div className="h-full overflow-y-auto pb-32 px-4 pt-4 space-y-4">
      {/* Minimal Top Bar */}
      <div className="flex items-center justify-between py-2">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Subdomain</span>
        </motion.div>
        
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </motion.button>
      </div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Hello, Hacker</h1>
        <p className="text-gray-500 text-sm">Ready to scan?</p>
      </motion.div>

      {/* Big Search Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onScanClick}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-3xl p-5 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Enter domain</p>
            <p className="text-gray-500 text-xs">Required: .com, .net, .org, etc.</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {[
          { label: 'Fast Scan', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Deep Scan', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'CF Check', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full whitespace-nowrap active:scale-95 transition-transform hover:bg-gray-800/70"
          >
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <span className="text-sm text-white font-medium">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Stats Compact Cards (Horizontal Scroll) */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Latest Scan</h2>
            <button className="text-xs text-blue-400">View All</button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {[
              { label: 'Total', value: stats.total, icon: Globe, bg: 'bg-blue-500/20', color: 'text-blue-400' },
              { label: 'Alive', value: stats.alive, icon: Activity, bg: 'bg-green-500/20', color: 'text-green-400' },
              { label: 'Protected', value: stats.protected, icon: ShieldCheck, bg: 'bg-purple-500/20', color: 'text-purple-400' },
              { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, bg: 'bg-red-500/20', color: 'text-red-400' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="min-w-[120px] p-4 bg-gray-800/30 border border-gray-700/50 rounded-2xl snap-center"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Scans Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Recent Scans</h2>
          <Clock className="w-4 h-4 text-gray-600" />
        </div>

        <div className="bg-gray-800/30 border border-gray-700/50 rounded-3xl p-4 space-y-3">
          {recentScans.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-4">No recent scans</p>
          ) : (
            recentScans.slice(0, 3).map((domain, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-black/30 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{domain}</p>
                    <p className="text-xs text-gray-500">2h ago</p>
                  </div>
                </div>
                <button className="text-gray-500">
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Bottom Padding for Nav */}
      <div className="h-20" />
    </div>
  );
}