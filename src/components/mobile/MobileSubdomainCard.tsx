'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Zap, Lock, AlertTriangle, ChevronRight, Copy } from 'lucide-react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';

interface MobileSubdomainCardProps {
  subdomain: SubdomainResult;
  index: number;
  onSelect: (subdomain: SubdomainResult) => void;
}

export function MobileSubdomainCard({ subdomain, index, onSelect }: MobileSubdomainCardProps) {
  const { addToFavorites, removeFromFavorites, favoriteDomains } = useScanStore();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(subdomain.subdomain);
  };

  const getStatusColor = () => {
    if (!subdomain.alive) return 'bg-gray-500/20 text-gray-500';
    if (subdomain.riskLevel === 'critical') return 'bg-red-500/20 text-red-400';
    if (subdomain.riskLevel === 'high') return 'bg-orange-500/20 text-orange-400';
    if (subdomain.riskLevel === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getStatusText = () => {
    if (!subdomain.alive) return 'Dead';
    return subdomain.riskLevel.charAt(0).toUpperCase() + subdomain.riskLevel.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(subdomain)}
      className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-4 active:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-lg mb-1">{subdomain.subdomain}</h3>
          <p className="text-gray-500 text-xs truncate">
            {subdomain.title || 'No title available'}
          </p>
        </div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="p-2 rounded-xl bg-gray-700/30"
        >
          <Copy className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>

        {/* Cloudflare Badge */}
        {subdomain.cloudflare && (
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center gap-1">
            <Shield className="w-3 h-3" />
            CF
          </span>
        )}

        {/* WAF Badge */}
        {subdomain.waf.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
            {subdomain.waf[0]}
          </span>
        )}

        {/* SSL Badge */}
        {subdomain.ssl && (
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            SSL
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <Zap className="w-4 h-4" />
          <span className="text-sm">{subdomain.responseTime}ms</span>
        </div>

        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.div>
      </div>
    </motion.div>
  );
}