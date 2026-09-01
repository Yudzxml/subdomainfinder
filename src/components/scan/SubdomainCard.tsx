'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Copy, Check, ChevronRight, Timer, Globe } from 'lucide-react';
import { useState } from 'react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';
import { useToast } from '@/hooks/use-toast';

const RISK_STYLES: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  high: 'bg-orange-500/15 text-orange-400 ring-orange-500/30',
  critical: 'bg-red-500/15 text-red-400 ring-red-500/30',
};

interface SubdomainCardProps {
  subdomain: SubdomainResult;
  index: number;
  compact?: boolean;
}

export function SubdomainCard({ subdomain, index, compact = false }: SubdomainCardProps) {
  const setSelectedSubdomain = useScanStore((s) => s.setSelectedSubdomain);
  const setIsDetailOpen = useScanStore((s) => s.setIsDetailOpen);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(subdomain.subdomain).then(() => {
      setCopied(true);
      toast({ title: 'Copied', description: subdomain.subdomain });
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const openDetail = () => {
    setSelectedSubdomain(subdomain);
    setIsDetailOpen(true);
  };

  const riskStyle = subdomain.alive
    ? RISK_STYLES[subdomain.riskLevel] ?? RISK_STYLES.low
    : 'bg-white/5 text-muted-foreground ring-white/10';

  const riskLabel = subdomain.alive
    ? subdomain.riskLevel.charAt(0).toUpperCase() + subdomain.riskLevel.slice(1)
    : 'Offline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={openDetail}
      onKeyDown={(e) => e.key === 'Enter' && openDetail()}
      role="button"
      tabIndex={0}
      className="group glass relative cursor-pointer rounded-2xl p-4 transition-colors hover:border-emerald-500/30 hover:bg-white/[0.06] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-mono text-sm font-semibold text-foreground sm:text-[15px]">
            {subdomain.subdomain}
          </h3>
          {!compact && subdomain.title && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subdomain.title}</p>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-all hover:bg-white/10 hover:text-foreground hover:opacity-100 active:scale-90"
          aria-label={`Copy ${subdomain.subdomain}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${riskStyle}`}>
          {riskLabel}
        </span>

        {subdomain.cloudflare && (
          <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-medium text-orange-400 ring-1 ring-orange-500/30">
            <Shield className="h-3 w-3" />
            CF
          </span>
        )}

        {subdomain.waf.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 ring-1 ring-violet-500/30">
            <ShieldAlert className="h-3 w-3" />
            {subdomain.waf[0]}
          </span>
        )}

        {subdomain.alive && subdomain.responseTime > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-white/10">
            <Timer className="h-3 w-3" />
            {subdomain.responseTime}ms
          </span>
        )}

        {subdomain.alive && subdomain.status > 0 && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${
              subdomain.status === 200
                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/25'
                : 'bg-white/5 text-muted-foreground ring-white/10'
            }`}
          >
            {subdomain.status}
          </span>
        )}

        {subdomain.ipAddress && (
          <span className="hidden items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-white/10 sm:flex">
            <Globe className="h-3 w-3" />
            {subdomain.ipAddress}
          </span>
        )}
      </div>

      {/* Chevron hint (desktop hover) */}
      <ChevronRight className="absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60 sm:block" />
    </motion.div>
  );
}
