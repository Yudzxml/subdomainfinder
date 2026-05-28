'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Heart, HeartOff } from 'lucide-react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BottomSheetProps {
  subdomain: SubdomainResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheet({ subdomain, isOpen, onClose }: BottomSheetProps) {
  const { addToFavorites, removeFromFavorites, favoriteDomains } = useScanStore();

  if (!subdomain) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenLink = () => {
    window.open(`https://${subdomain.subdomain}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl max-h-[85vh]"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(85vh-60px)] px-4 pb-6">
              <div className="pt-2 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white mb-1">{subdomain.subdomain}</h2>
                    <p className="text-sm text-gray-500">{subdomain.title || 'No title'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (favoriteDomains.includes(subdomain.subdomain)) {
                          removeFromFavorites(subdomain.subdomain);
                        } else {
                          addToFavorites(subdomain.subdomain);
                        }
                      }}
                      className="p-2 rounded-xl bg-gray-800/50"
                    >
                      {favoriteDomains.includes(subdomain.subdomain) ? (
                        <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Heart className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl bg-gray-800/50"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {subdomain.status || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Status</p>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {subdomain.responseTime}ms
                    </p>
                    <p className="text-xs text-gray-500">Response</p>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {subdomain.riskScore}%
                    </p>
                    <p className="text-xs text-gray-500">Risk</p>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4">
                  <h3 className="text-white font-semibold mb-3">Security</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cloudflare</span>
                      <Badge
                        variant={subdomain.cloudflare ? 'default' : 'destructive'}
                        className="rounded-full"
                      >
                        {subdomain.cloudflare ? 'Protected' : 'Not Protected'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">WAF</span>
                      <div className="flex gap-1 flex-wrap">
                        {subdomain.waf.length > 0 ? (
                          subdomain.waf.map((waf, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="rounded-full border-purple-500/50 text-purple-400"
                            >
                              {waf}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">SSL</span>
                      <Badge
                        variant={subdomain.ssl ? 'default' : 'destructive'}
                        className="rounded-full"
                      >
                        {subdomain.ssl ? 'Secure' : 'Insecure'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Server Info */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4">
                  <h3 className="text-white font-semibold mb-3">Server Information</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Server</span>
                      <span className="text-sm text-white">{subdomain.server || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">IP Address</span>
                      <span className="text-sm text-white">{subdomain.ipAddress || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Country</span>
                      <span className="text-sm text-white">{subdomain.country || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                {subdomain.techStack.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4">
                    <h3 className="text-white font-semibold mb-3">Tech Stack</h3>
                    <div className="flex gap-2 flex-wrap">
                      {subdomain.techStack.slice(0, 5).map((tech, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="rounded-full border-blue-500/50 text-blue-400"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {subdomain.techStack.length > 5 && (
                        <Badge variant="secondary" className="rounded-full">
                          +{subdomain.techStack.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* DNS Records */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4">
                  <h3 className="text-white font-semibold mb-3">DNS Records</h3>
                  <div className="space-y-2">
                    {Object.entries(subdomain.dnsRecords).map(([type, records]) => (
                      <div key={type}>
                        <p className="text-xs text-gray-500 mb-1">{type}</p>
                        <div className="flex gap-1 flex-wrap">
                          {Array.isArray(records) && records.length > 0 ? (
                            records.slice(0, 3).map((record: string, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="rounded-full text-xs font-mono"
                              >
                                {record}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-600">None</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleOpenLink}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>
                  <button
                    onClick={() => handleCopy(subdomain.subdomain)}
                    className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}