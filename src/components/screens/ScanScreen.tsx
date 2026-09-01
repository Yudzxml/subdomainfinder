'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Radar, AlertTriangle, RotateCcw } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { useScan } from '@/hooks/use-scan';
import { useSession } from '@/hooks/use-session';

const PHASE_LABELS: Record<string, string> = {
  enumeration: 'Enumeration',
  session: 'Session',
  dns_resolution: 'DNS Resolution',
  http_check: 'HTTP Probing',
  cloudflare_detection: 'Cloudflare Detection',
  waf_detection: 'WAF Detection',
  ssl_analysis: 'SSL Analysis',
  headers_analysis: 'Header Analysis',
  risk_analysis: 'Risk Analysis',
  finalizing: 'Finalizing',
  error: 'Error',
};

const PHASE_STEPS = [
  'Establishing session',
  'Enumerating subdomains',
  'HTTP probing',
  'Detection & analysis',
  'Finalizing',
];

function phaseToStep(phase: string): number {
  if (!phase) return 0;
  const p = phase.toLowerCase();
  if (p.includes('session') || p.includes('initial')) return 0;
  if (p.includes('enum')) return 1;
  if (p.includes('http') || p.includes('probe') || p.includes('dns')) return 2;
  if (p.includes('final') || p.includes('complet')) return 4;
  return 3;
}

export function ScanScreen() {
  const isScanning = useScanStore((s) => s.isScanning);
  const progress = useScanStore((s) => s.scanProgress);
  const phase = useScanStore((s) => s.scanPhase);
  const scanError = useScanStore((s) => s.scanError);
  const domain = useScanStore((s) => s.domain);
  const logs = useScanStore((s) => s.scanLogs);
  const setScanModalOpen = useScanStore((s) => s.setScanModalOpen);
  const setActiveTab = useScanStore((s) => s.setActiveTab);
  const { cancelScan } = useScan();
  const { refreshSession } = useSession();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const finished = !isScanning;
  const hasError = !!scanError;
  const visibleLogs = showAllLogs ? logs : logs.slice(-6);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleLogs.length]);

  const currentStep = phaseToStep(phase);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground sm:text-xl">
            {hasError ? 'Scan Failed' : finished ? 'Scan Finished' : 'Scanning'}
          </h1>
          {domain && (
            <p className="truncate font-mono text-xs text-muted-foreground sm:text-sm">{domain}</p>
          )}
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label="Close scanner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Radar visualization */}
      <div className="relative mx-auto mb-8 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        {/* Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 ${
            hasError
              ? 'bg-red-500/10'
              : finished
                ? 'bg-emerald-500/15'
                : 'bg-emerald-500/[0.07]'
          }`}
        />

        {/* Outer rings */}
        {[1, 0.72, 0.46].map((scale, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-emerald-500/15"
            style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
            animate={
              !finished && !hasError
                ? { scale: [1, 1.04, 1], opacity: [0.5, 1, 0.5] }
                : { scale: 1, opacity: 0.4 }
            }
            transition={{ duration: 2.4, delay: i * 0.4, repeat: !finished && !hasError ? Infinity : 0 }}
          />
        ))}

        {/* Sweep beam */}
        {!finished && !hasError && (
          <motion.div
            className="scan-ring absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Center */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={
              !finished && !hasError
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 1.8, repeat: !finished ? Infinity : 0 }}
            className={`flex h-28 w-28 items-center justify-center rounded-full border-2 backdrop-blur-sm sm:h-32 sm:w-32 ${
              hasError
                ? 'border-red-500/50 bg-red-500/10'
                : finished
                  ? 'border-emerald-400/60 bg-emerald-500/10'
                  : 'border-emerald-500/40 bg-black/50'
            }`}
          >
            {hasError ? (
              <AlertTriangle className="h-9 w-9 text-red-400" />
            ) : (
              <div className="text-center">
                <span className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                  {Math.round(progress)}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
          </motion.div>

          {/* Phase label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`mt-4 text-sm font-medium ${
                hasError ? 'text-red-400' : finished ? 'text-emerald-400' : 'text-foreground'
              }`}
            >
              {hasError ? 'Something went wrong' : phase || 'Waiting…'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Step progress */}
      {!hasError && (
        <div className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-2">
          {PHASE_STEPS.map((step, i) => (
            <div key={step} className="text-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  hasError
                    ? 'bg-red-500/30'
                    : i < currentStep || (finished && progress >= 100)
                      ? 'bg-emerald-400'
                      : i === currentStep
                        ? 'bg-gradient-to-r from-emerald-500/60 to-cyan-500/60'
                        : 'bg-white/8'
                }`}
              />
              <p
                className={`mt-1.5 hidden text-[10px] leading-tight sm:block ${
                  i === currentStep && !finished ? 'text-emerald-400' : 'text-muted-foreground/60'
                }`}
              >
                {step.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Error card */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-4 sm:p-5"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Error
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{scanError}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                refreshSession();
                setScanModalOpen(true);
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-black"
            >
              Try again
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="glass rounded-xl px-4 py-2 text-xs font-medium text-foreground"
            >
              Back home
            </button>
          </div>
        </motion.div>
      )}

      {/* Live logs */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
          </div>
          <div className="flex items-center gap-2">
            {!finished && !hasError && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-medium text-emerald-400">Live</span>
              </>
            )}
            {logs.length > 6 && (
              <button
                onClick={() => setShowAllLogs((v) => !v)}
                className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {showAllLogs ? 'Show less' : `All ${logs.length}`}
              </button>
            )}
          </div>
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin px-4 py-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              {isScanning ? 'Initializing scanner…' : 'No activity. Start a scan to see logs.'}
            </p>
          ) : (
            <>
              {visibleLogs.map((log, i) => (
                <motion.div
                  key={`${log.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="shrink-0 text-muted-foreground/50">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 text-[10px] font-semibold uppercase ${
                      log.phase === 'error'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {PHASE_LABELS[log.phase] ?? log.phase}
                  </span>
                  <span className="min-w-0 break-words text-foreground/80">{log.message}</span>
                </motion.div>
              ))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Cancel / actions */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {isScanning ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={cancelScan}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 py-3.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <X className="h-4 w-4" />
            Cancel Scan
          </motion.button>
        ) : !hasError ? (
          <>
            {progress >= 100 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('results')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25"
              >
                <Radar className="h-4 w-4" />
                View Results
              </motion.button>
            )}
            <button
              onClick={() => setScanModalOpen(true)}
              className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              New Scan
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
