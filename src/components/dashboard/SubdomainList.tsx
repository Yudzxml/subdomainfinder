'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ShieldAlert,
  Globe,
  Clock,
  Server,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { SubdomainResult } from '@/types/scan';

interface SubdomainListProps {
  subdomains: SubdomainResult[];
  onSelect: (subdomain: SubdomainResult) => void;
}

export function SubdomainList({ subdomains, onSelect }: SubdomainListProps) {
  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {subdomains.map((subdomain, index) => (
        <motion.div
          key={subdomain.subdomain}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
        >
          <Card
            className="p-4 bg-black/50 backdrop-blur-xl border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
            onClick={() => onSelect(subdomain)}
          >
            <div className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="flex-shrink-0">
                {subdomain.alive ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                ) : (
                  <div className="w-3 h-3 bg-gray-600 rounded-full" />
                )}
              </div>

              {/* Subdomain info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                    {subdomain.subdomain}
                  </h3>
                  {subdomain.cloudflare && (
                    <Shield className="w-4 h-4 text-orange-500" />
                  )}
                  {subdomain.riskScore >= 50 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {subdomain.status && (
                    <span className={`flex items-center gap-1 ${getStatusColor(subdomain.status)}`}>
                      HTTP {subdomain.status}
                    </span>
                  )}
                  {subdomain.responseTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {subdomain.responseTime}ms
                    </span>
                  )}
                  {subdomain.title && (
                    <span className="truncate max-w-[200px]">{subdomain.title}</span>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                {subdomain.waf.length > 0 && (
                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                    {subdomain.waf[0]}
                  </Badge>
                )}
                {subdomain.ipAddress && subdomain.ipAddress !== 'Unknown' && (
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                    {subdomain.country}
                  </Badge>
                )}
              </div>

              {/* Risk indicator */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <div className={`w-2 h-16 rounded-full ${getRiskColor(subdomain.riskScore)}`} />
                <span className="text-xs text-gray-400">{subdomain.riskScore}%</span>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </Card>
        </motion.div>
      ))}

      {subdomains.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No subdomains found</p>
        </div>
      )}
    </div>
  );
}