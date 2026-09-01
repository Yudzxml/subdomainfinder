'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock3, Star, Trash2, Globe, Zap, X, History as HistoryIcon } from 'lucide-react';
import { useState } from 'react';
import { useScanStore } from '@/store/scan-store';
import { useScan } from '@/hooks/use-scan';
import { useToast } from '@/hooks/use-toast';

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryScreen() {
  const recentScans = useScanStore((s) => s.recentScans);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const removeRecent = useScanStore((s) => s.removeRecent);
  const clearRecent = useScanStore((s) => s.clearRecent);
  const toggleFavorite = useScanStore((s) => s.toggleFavorite);
  const addToRecent = useScanStore((s) => s.addToRecent);
  const { scanDomain } = useScan();
  const { toast } = useToast();
  const [tab, setTab] = useState<'recent' | 'favorites'>('recent');

  const rescan = async (domain: string) => {
    useScanStore.getState().resetScan();
    useScanStore.getState().setActiveTab('scan');
    const ok = await scanDomain(domain, true);
    if (ok) {
      useScanStore.getState().setActiveTab('results');
      toast({ title: 'Scan complete', description: `${domain} rescanned` });
    } else {
      toast({ title: 'Scan failed', description: 'Check the scan screen for details', variant: 'destructive' });
    }
  };

  const items =
    tab === 'recent'
      ? recentScans.map((r) => ({ domain: r.domain, meta: `${formatRelative(r.scannedAt)} · ${r.totalFound} found`, scannedAt: r.scannedAt }))
      : favoriteDomains.map((d) => ({ domain: d, meta: 'Favorite target', scannedAt: 0 }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground sm:text-xl">History</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {recentScans.length} scan{recentScans.length !== 1 ? 's' : ''} · {favoriteDomains.length} favorite{favoriteDomains.length !== 1 ? 's' : ''}
          </p>
        </div>
        {tab === 'recent' && recentScans.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              clearRecent();
              toast({ title: 'History cleared' });
            }}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="glass grid grid-cols-2 gap-1 rounded-2xl p-1" role="tablist">
        {(
          [
            { id: 'recent', label: 'Recent Scans', icon: Clock3 },
            { id: 'favorites', label: 'Favorites', icon: Star },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            className={`relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="history-tab"
                className="absolute inset-0 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <t.icon className={`relative z-10 h-4 w-4 ${tab === t.id ? 'text-emerald-400' : ''}`} />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            {tab === 'recent' ? (
              <HistoryIcon className="h-7 w-7 text-muted-foreground" />
            ) : (
              <Star className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {tab === 'recent' ? 'No scan history' : 'No favorites yet'}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {tab === 'recent'
              ? 'Domains you scan will be tracked here for quick re-scanning.'
              : 'Star domains in the command palette or detail view to pin them here.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const isFav = favoriteDomains.includes(item.domain);
              return (
                <motion.li
                  key={item.domain}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.03 }}
                  className="glass group flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-colors hover:border-emerald-500/30 sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 ring-1 ring-white/10">
                      <Globe className="h-[18px] w-[18px] text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium text-foreground">
                        {item.domain}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        const nowFav = toggleFavorite(item.domain);
                        toast({ title: nowFav ? 'Added to favorites' : 'Removed from favorites', description: item.domain });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-amber-400"
                      aria-label={isFav ? `Unfavorite ${item.domain}` : `Favorite ${item.domain}`}
                    >
                      <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => rescan(item.domain)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-emerald-500/15 hover:text-emerald-400"
                      aria-label={`Scan ${item.domain} again`}
                    >
                      <Zap className="h-4 w-4" />
                    </motion.button>
                    {tab === 'recent' && (
                      <button
                        onClick={() => removeRecent(item.domain)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        aria-label={`Remove ${item.domain} from history`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Hint */}
      {tab === 'recent' && recentScans.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tip: tap the lightning icon to instantly rescan a domain with a forced cache refresh.
        </p>
      )}
    </div>
  );
}
