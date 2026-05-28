'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  X,
  ExternalLink,
  Copy,
  Shield,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Globe,
  Clock,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  Heart,
  HeartOff,
} from 'lucide-react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';

interface DetailDrawerProps {
  subdomain: SubdomainResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailDrawer({ subdomain, isOpen, onClose }: DetailDrawerProps) {
  const { addToFavorites, removeFromFavorites, favoriteDomains } = useScanStore();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenLink = () => {
    if (subdomain) {
      window.open(`https://${subdomain.subdomain}`, '_blank');
    }
  };

  if (!subdomain) return null;

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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-black/95 border-l border-gray-800 z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${subdomain.alive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate">{subdomain.subdomain}</h2>
                    <p className="text-sm text-gray-500">{subdomain.title || 'No title'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenLink}
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (favoriteDomains.includes(subdomain.subdomain)) {
                        removeFromFavorites(subdomain.subdomain);
                      } else {
                        addToFavorites(subdomain.subdomain);
                      }
                    }}
                    title={favoriteDomains.includes(subdomain.subdomain) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favoriteDomains.includes(subdomain.subdomain) ? (
                      <Heart className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3 bg-black/50 border-gray-800">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Activity className="w-3 h-3" />
                        Status
                      </div>
                      <div className="text-lg font-bold text-white">
                        {subdomain.status || 'N/A'}
                      </div>
                    </Card>
                    <Card className="p-3 bg-black/50 border-gray-800">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        Response
                      </div>
                      <div className="text-lg font-bold text-white">
                        {subdomain.responseTime}ms
                      </div>
                    </Card>
                    <Card className="p-3 bg-black/50 border-gray-800">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Risk
                      </div>
                      <div className="text-lg font-bold text-white">
                        {subdomain.riskScore}%
                      </div>
                    </Card>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Security Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Status
                    </h3>
                    <Card className="p-4 bg-black/50 border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Cloudflare Protection</span>
                        <Badge variant={subdomain.cloudflare ? 'default' : 'destructive'} className="gap-1">
                          {subdomain.cloudflare ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Protected
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Not Protected
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">WAF Detected</span>
                        <div className="flex gap-1 flex-wrap">
                          {subdomain.waf.length > 0 ? (
                            subdomain.waf.map((waf, i) => (
                              <Badge key={i} variant="outline" className="border-purple-500/50 text-purple-400">
                                {waf}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">None detected</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">SSL/TLS</span>
                        <Badge variant={subdomain.ssl ? 'default' : 'destructive'} className="gap-1">
                          <Lock className="w-3 h-3" />
                          {subdomain.ssl ? 'Secure' : 'Insecure'}
                        </Badge>
                      </div>

                      {subdomain.sslInfo && (
                        <div className="pt-2 border-t border-gray-800 space-y-2">
                          {subdomain.sslInfo.issuer && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Issuer</span>
                              <span className="text-xs text-white">{subdomain.sslInfo.issuer}</span>
                            </div>
                          )}
                          {subdomain.sslInfo.daysRemaining !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Days Until Expiry</span>
                              <span className="text-xs text-white">{subdomain.sslInfo.daysRemaining}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Server Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Server Information
                    </h3>
                    <Card className="p-4 bg-black/50 border-gray-800">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Server</span>
                          <span className="text-sm font-mono text-white">
                            {subdomain.server || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">IP Address</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-white">
                              {subdomain.ipAddress || 'N/A'}
                            </span>
                            {subdomain.ipAddress && subdomain.ipAddress !== 'Unknown' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => handleCopy(subdomain.ipAddress!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Country</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{subdomain.country}</span>
                            <span className="text-xs text-gray-500">{subdomain.asn}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Security Headers */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Security Headers</h3>
                    <Card className="p-4 bg-black/50 border-gray-800">
                      <div className="space-y-2">
                        {Object.entries(subdomain.securityHeaders).map(([header, info]: [string, any]) => (
                          <div key={header} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{header}</span>
                            <Badge
                              variant={
                                info.status === 'good'
                                  ? 'default'
                                  : info.status === 'weak'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                              className="capitalize"
                            >
                              {info.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Tech Stack */}
                  {subdomain.techStack.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Tech Stack</h3>
                      <Card className="p-4 bg-black/50 border-gray-800">
                        <div className="flex gap-2 flex-wrap">
                          {subdomain.techStack.map((tech, i) => (
                            <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  <Separator className="bg-gray-800" />

                  {/* DNS Records */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">DNS Records</h3>
                    <Card className="p-4 bg-black/50 border-gray-800">
                      <div className="space-y-3">
                        {Object.entries(subdomain.dnsRecords).map(([type, records]: [string, any]) => (
                          <div key={type}>
                            <p className="text-xs text-gray-500 mb-1">{type}</p>
                            <div className="flex gap-1 flex-wrap">
                              {Array.isArray(records) && records.length > 0 ? (
                                records.map((record: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs font-mono">
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
                    </Card>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Redirect Chain */}
                  {subdomain.redirectUrl && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Redirect Chain</h3>
                      <Card className="p-4 bg-black/50 border-gray-800">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {subdomain.subdomain}
                            </Badge>
                            <span className="text-gray-500">→</span>
                            <Badge variant="outline" className="text-xs text-blue-400">
                              {subdomain.redirectUrl}
                            </Badge>
                          </div>
                          {subdomain.redirectChain.map((url, i) => (
                            <div key={i} className="flex items-center gap-2 ml-4">
                              <span className="text-gray-500">→</span>
                              <Badge variant="outline" className="text-xs text-blue-400">
                                {url}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleOpenLink}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Website
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleCopy(subdomain.subdomain)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Subdomain
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}