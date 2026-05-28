'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ShieldAlert,
  Globe,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  Heart,
  HeartOff,
} from 'lucide-react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';

interface SubdomainGridProps {
  subdomains: SubdomainResult[];
  onSelect: (subdomain: SubdomainResult) => void;
}

export function SubdomainGrid({ subdomains, onSelect }: SubdomainGridProps) {
  const { addToFavorites, removeFromFavorites, favoriteDomains } = useScanStore();

  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskBorder = (score: number) => {
    if (score >= 75) return 'border-red-500/50 hover:border-red-500';
    if (score >= 50) return 'border-orange-500/50 hover:border-orange-500';
    if (score >= 25) return 'border-yellow-500/50 hover:border-yellow-500';
    return 'border-gray-800 hover:border-green-500/50';
  };

  const toggleFavorite = (e: React.MouseEvent, subdomain: string) => {
    e.stopPropagation();
    if (favoriteDomains.includes(subdomain)) {
      removeFromFavorites(subdomain);
    } else {
      addToFavorites(subdomain);
    }
  };

  const copySubdomain = (e: React.MouseEvent, subdomain: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(subdomain);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {subdomains.map((item, index) => (
        <motion.div
          key={item.subdomain}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <Card
            className={`p-4 bg-black/50 backdrop-blur-xl border ${getRiskBorder(item.riskScore)} transition-all cursor-pointer group hover:shadow-lg hover:shadow-green-500/10`}
            onClick={() => onSelect(item)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full ${item.alive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                <h3 className="font-semibold text-white text-sm truncate">
                  {item.subdomain}
                </h3>
              </div>

              {/* Protection indicator */}
              {item.cloudflare ? (
                <Shield className="w-4 h-4 text-orange-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.status && (
                <Badge variant="outline" className={`text-xs border-gray-700 ${getStatusColor(item.status)}`}>
                  {item.status}
                </Badge>
              )}
              {item.ssl && (
                <Badge variant="outline" className="text-xs border-gray-700 text-green-400">
                  <Lock className="w-3 h-3 mr-1" />
                  SSL
                </Badge>
              )}
              {item.waf.length > 0 && (
                <Badge variant="outline" className="text-xs border-gray-700 text-purple-400">
                  {item.waf[0]}
                </Badge>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-3">
              {item.title && (
                <div className="text-xs text-gray-400 truncate" title={item.title}>
                  {item.title}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.responseTime}ms
                </span>
                <span>{item.country}</span>
              </div>
            </div>

            {/* Tech stack */}
            {item.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.techStack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-[10px]">
                    {tech}
                  </Badge>
                ))}
                {item.techStack.length > 3 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{item.techStack.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Risk indicator & actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              {/* Risk score */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-8 rounded-full ${getRiskColor(item.riskScore)}`} />
                <span className="text-xs text-gray-400">{item.riskScore}%</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => toggleFavorite(e, item.subdomain)}
                  className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                  title={favoriteDomains.includes(item.subdomain) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favoriteDomains.includes(item.subdomain) ? (
                    <Heart className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <Heart className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={(e) => copySubdomain(e, item.subdomain)}
                  className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                  title="Copy subdomain"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <a
                  href={`https://${item.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </div>

            {/* Risk badge */}
            {item.riskScore >= 50 && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </div>
            )}
          </Card>
        </motion.div>
      ))}

      {subdomains.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No subdomains found</p>
        </div>
      )}
    </div>
  );
}