'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Copy, Heart, Lock, Unlock, Shield, ShieldOff,
  Timer, Globe, Server, MapPin, Cpu, FileSearch, AlertTriangle, Check,
} from 'lucide-react';
import { useState } from 'react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';
import { useToast } from '@/hooks/use-toast';

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3.5 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="truncate text-right font-mono text-xs text-foreground">{value || '—'}</span>
    </div>
  );
}

export function DetailSheet() {
  const isOpen = useScanStore((s) => s.isDetailOpen);
  const setOpen = useScanStore((s) => s.setIsDetailOpen);
  const subdomain = useScanStore((s) => s.selectedSubdomain);
  const toggleFavorite = useScanStore((s) => s.toggleFavorite);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!subdomain) return null;

  const isFav = favoriteDomains.includes(subdomain.subdomain);

  const handleCopy = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: label, description: text });
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const headerStatus = !subdomain.alive
    ? { text: 'Offline', cls: 'bg-white/8 text-muted-foreground ring-white/15' }
    : subdomain.riskLevel === 'critical'
      ? { text: 'Critical Risk', cls: 'bg-red-500/15 text-red-400 ring-red-500/30' }
      : subdomain.riskLevel === 'high'
        ? { text: 'High Risk', cls: 'bg-orange-500/15 text-orange-400 ring-orange-500/30' }
        : subdomain.riskLevel === 'medium'
          ? { text: 'Medium Risk', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' }
          : { text: 'Low Risk', cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            className="glass-strong fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[88vh] max-w-2xl overflow-hidden rounded-t-3xl pb-safe sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${subdomain.subdomain}`}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="max-h-[calc(88vh-28px)] overflow-y-auto scrollbar-thin px-5 pb-8 pt-4 sm:px-6">
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-all font-mono text-lg font-bold text-foreground">
                    {subdomain.subdomain}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${headerStatus.cls}`}>
                      {headerStatus.text}
                    </span>
                    {subdomain.cloudflare && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-medium text-orange-400 ring-1 ring-orange-500/30">
                        <Shield className="h-3 w-3" /> Cloudflare
                      </span>
                    )}
                    {subdomain.ssl && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                        <Lock className="h-3 w-3" /> SSL
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCopy(subdomain.subdomain)}
                  className="glass flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-colors hover:border-emerald-500/40"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => window.open(`https://${subdomain.subdomain}`, '_blank', 'noopener,noreferrer')}
                  className="glass flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-colors hover:border-emerald-500/40"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const nowFav = toggleFavorite(subdomain.subdomain);
                    toast({
                      title: nowFav ? 'Added to favorites' : 'Removed from favorites',
                      description: subdomain.subdomain,
                    });
                  }}
                  className={`glass flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-colors hover:border-emerald-500/40 ${
                    isFav ? 'text-amber-400' : ''
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  {isFav ? 'Saved' : 'Favorite'}
                </motion.button>
              </div>

              {/* Title */}
              {subdomain.title && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-white/[0.03] px-4 py-3">
                  <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Page Title</p>
                    <p className="mt-0.5 text-sm text-foreground">{subdomain.title}</p>
                  </div>
                </div>
              )}

              {/* Network info */}
              <div className="mb-5 space-y-1.5">
                <Row icon={Globe} label="IP Address" value={subdomain.ipAddress} />
                <Row icon={Server} label="Server" value={subdomain.server} />
                <Row icon={MapPin} label="Country" value={subdomain.country} />
                <Row icon={Timer} label="Response" value={subdomain.responseTime ? `${subdomain.responseTime} ms` : null} />
                <Row icon={Cpu} label="ASN" value={subdomain.asn} />
              </div>

              {/* WAF */}
              {subdomain.waf.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    WAF Detection
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {subdomain.waf.map((w) => (
                      <span key={w} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/30">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech stack */}
              {subdomain.techStack.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {subdomain.techStack.map((t) => (
                      <span key={t} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/25">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SSL info */}
              {subdomain.sslInfo?.active && (
                <div className="mb-5 rounded-xl bg-white/[0.03] px-4 py-3">
                  <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> SSL Certificate
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Issuer</p>
                      <p className="mt-0.5 font-mono text-foreground">{subdomain.sslInfo.issuer || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid Until</p>
                      <p className="mt-0.5 font-mono text-foreground">
                        {subdomain.sslInfo.validTo ? new Date(subdomain.sslInfo.validTo).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TLS Version</p>
                      <p className="mt-0.5 font-mono text-foreground">{subdomain.sslInfo.tlsVersion || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className={`mt-0.5 font-mono ${subdomain.sslInfo.daysRemaining < 30 ? 'text-amber-400' : 'text-foreground'}`}>
                        {subdomain.sslInfo.daysRemaining ?? '—'}
                      </p>
                    </div>
                  </div>
                  {subdomain.sslInfo.warnings?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {subdomain.sslInfo.warnings.map((w, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-xs text-amber-400">
                          <AlertTriangle className="h-3 w-3" /> {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Security headers */}
              {subdomain.securityHeaders && (
                <div className="mb-2">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Security Headers
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {Object.entries(subdomain.securityHeaders).map(([name, info]: [string, any]) => (
                      <div key={name} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="truncate font-mono text-[11px] text-muted-foreground">{name}</span>
                        {info?.status === 'good' ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <Check className="h-3 w-3" /> Good
                          </span>
                        ) : info?.status === 'weak' ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <ShieldOff className="h-3 w-3" /> Weak
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-red-400">
                            <X className="h-3 w-3" /> Missing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
