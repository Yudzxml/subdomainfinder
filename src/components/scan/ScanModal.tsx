'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, ArrowRight, Globe, Loader2, Clock3, Star, X } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useScan, isValidDomainFormat } from '@/hooks/use-scan';
import { useToast } from '@/hooks/use-toast';

const QUICK_DOMAINS = ['github.com', 'google.com', 'cloudflare.com', 'vercel.com'];

export function ScanModal() {
  const isOpen = useScanStore((s) => s.isScanModalOpen);
  const setOpen = useScanStore((s) => s.setScanModalOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContent onClose={() => setOpen(false)} />
      )}
    </AnimatePresence>
  );
}

/** Inner form mounted fresh each time the modal opens (remount resets state). */
function ModalContent({ onClose }: { onClose: () => void }) {
  const recentScans = useScanStore((s) => s.recentScans);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const { scanDomain, isScanning } = useScan();
  const { toast } = useToast();

  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clean = value.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
  const isValid = isValidDomainFormat(clean);
  const showError = touched && clean.length > 0 && !isValid;

  // Focus the input shortly after mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const startScan = useCallback(
    async (domain: string) => {
      const target = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
      if (!isValidDomainFormat(target)) {
        setTouched(true);
        toast({
          title: 'Invalid domain',
          description: 'Enter a valid domain with its extension — e.g. example.com',
          variant: 'destructive',
        });
        return;
      }
      onClose();
      useScanStore.getState().setActiveTab('scan');
      useScanStore.getState().resetScan();
      const ok = await scanDomain(target);
      if (ok) {
        useScanStore.getState().setActiveTab('results');
        toast({
          title: 'Scan complete',
          description: `Found ${useScanStore.getState().stats?.total ?? 0} subdomains for ${target}`,
        });
      } else {
        const err = useScanStore.getState().scanError;
        if (err) {
          useScanStore.getState().setActiveTab('scan');
          toast({
            title: 'Scan failed',
            description: err,
            variant: 'destructive',
          });
        }
      }
    },
    [scanDomain, onClose, toast]
  );

  const suggestions = [
    ...favoriteDomains.map((d) => ({ domain: d, icon: Star, tint: 'text-amber-400' })),
    ...recentScans
      .filter((r) => !favoriteDomains.includes(r.domain))
      .map((r) => ({ domain: r.domain, icon: Clock3, tint: 'text-muted-foreground' })),
  ].slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Start a new scan"
    >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-lg rounded-t-3xl p-5 pb-safe shadow-2xl sm:rounded-3xl sm:p-6"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 ring-1 ring-emerald-400/30">
                  <Radar className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Start a Scan</h2>
                  <p className="text-xs text-muted-foreground">
                    Enumerate subdomains from 6 sources
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input */}
            <div
              className={`mb-2 flex items-center gap-3 rounded-2xl border bg-black/30 px-4 py-3.5 transition-colors ${
                showError
                  ? 'border-red-500/50'
                  : isValid
                    ? 'border-emerald-500/50'
                    : 'border-border focus-within:border-emerald-500/40'
              }`}
            >
              <Globe className={`h-5 w-5 shrink-0 ${isValid ? 'text-emerald-400' : 'text-muted-foreground'}`} />
              <input
                ref={inputRef}
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="example.com"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => setTouched(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') startScan(value);
                }}
                className="w-full bg-transparent font-mono text-base text-foreground outline-none placeholder:text-muted-foreground/50"
                aria-label="Domain to scan"
                aria-invalid={showError}
              />
              {isScanning && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
            </div>

            {/* Validation hint */}
            <div className="mb-4 min-h-[18px] px-1">
              {showError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400"
                >
                  Domain must include an extension — e.g. example.com
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => startScan(value)}
              disabled={isScanning}
              className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'cursor-not-allowed bg-white/5 text-muted-foreground'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  Launch Scan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>

            {/* Suggestions */}
            {(suggestions.length > 0 || recentScans.length === 0) && (
              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick targets
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(({ domain, icon: Icon, tint }) => (
                    <button
                      key={domain}
                      onClick={() => startScan(domain)}
                      className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/90 transition-all hover:border-emerald-500/40 hover:text-emerald-300 active:scale-95"
                    >
                      <Icon className={`h-3 w-3 ${tint}`} />
                      {domain}
                    </button>
                  ))}
                  {recentScans.length === 0 &&
                    QUICK_DOMAINS.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => startScan(domain)}
                        className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/90 transition-all hover:border-emerald-500/40 hover:text-emerald-300 active:scale-95"
                      >
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {domain}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
    </motion.div>
  );
}
