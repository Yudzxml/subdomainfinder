'use client';

import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Download, LayoutGrid, List, Radar, X, FileJson, FileSpreadsheet, FileType, ChevronDown,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useScanStore } from '@/store/scan-store';
import { SubdomainCard } from '@/components/scan/SubdomainCard';
import { useToast } from '@/hooks/use-toast';

export function ResultsScreen() {
  const domain = useScanStore((s) => s.domain);
  const stats = useScanStore((s) => s.stats);
  const filtered = useScanStore((s) => s.filteredSubdomains);
  const searchQuery = useScanStore((s) => s.searchQuery);
  const setSearchQuery = useScanStore((s) => s.setSearchQuery);
  const viewMode = useScanStore((s) => s.viewMode);
  const setViewMode = useScanStore((s) => s.setViewMode);
  const setIsFilterOpen = useScanStore((s) => s.setIsFilterOpen);
  const activeFilterCount = useScanStore((s) => s.getActiveFilterCount());
  const exportData = useScanStore((s) => s.exportData);
  const setScanModalOpen = useScanStore((s) => s.setScanModalOpen);
  const scanDurationMs = useScanStore((s) => s.scanDurationMs);
  const fromCache = useScanStore((s) => s.fromCache);
  const { toast } = useToast();

  const [exportOpen, setExportOpen] = useState(false);
  const [limit, setLimit] = useState(60);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  const hasResults = filtered.length > 0;
  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    exportData(format);
    setExportOpen(false);
    toast({
      title: 'Export started',
      description: `Downloading results as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground sm:text-xl">Results</h1>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {domain
              ? `${domain} · ${(scanDurationMs / 1000).toFixed(1)}s${fromCache ? ' · cached' : ''}`
              : 'No scan yet'}
          </p>
        </div>

        {hasResults && (
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="glass flex rounded-xl p-1" role="group" aria-label="View mode">
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Export */}
            <div className="relative" ref={exportRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setExportOpen((v) => !v)}
                className="glass flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-foreground transition-colors hover:border-emerald-500/40"
                aria-expanded={exportOpen}
                aria-haspopup="menu"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="glass-strong absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl p-1 shadow-2xl"
                  role="menu"
                >
                  {[
                    { format: 'json' as const, icon: FileJson, label: 'JSON', desc: 'Full data' },
                    { format: 'csv' as const, icon: FileSpreadsheet, label: 'CSV', desc: 'Spreadsheet' },
                    { format: 'txt' as const, icon: FileType, label: 'TXT', desc: 'Plain list' },
                  ].map(({ format, icon: Icon, label, desc }) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      role="menuitem"
                    >
                      <Icon className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Alive', value: stats.alive },
            { label: 'Protected', value: stats.protected },
            { label: 'High Risk', value: stats.highRisk },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl px-3.5 py-2.5 sm:px-4">
              <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
                {s.value.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      {hasResults && (
        <div className="flex items-center gap-2">
          <div className="glass flex h-10 flex-1 items-center gap-2.5 rounded-xl px-3.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter subdomains…"
              className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground/60"
              aria-label="Search results"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(true)}
            className={`glass relative flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium transition-colors ${
              activeFilterCount > 0 ? 'text-emerald-300' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4.5 min-w-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>
      )}

      {/* Results */}
      {!domain ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            <Radar className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No scan data</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Run a scan to discover subdomains and analyze their security posture.
          </p>
          <button
            onClick={() => setScanModalOpen(true)}
            className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-black shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
          >
            Start scanning
          </button>
        </div>
      ) : !hasResults ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {searchQuery || activeFilterCount > 0 ? 'No matches' : 'No subdomains found'}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search or clearing the active filters.'
              : 'This domain returned no subdomain records from the sources.'}
          </p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-2.5'}>
            {visible.map((sub, i) => (
              <SubdomainCard key={sub.subdomain} subdomain={sub} index={i} compact={viewMode === 'grid'} />
            ))}
          </div>

          {filtered.length > limit && (
            <button
              onClick={() => setLimit((l) => l + 60)}
              className="glass w-full rounded-2xl py-3 text-sm font-medium text-emerald-400 transition-colors hover:border-emerald-500/40"
            >
              Load more ({filtered.length - limit} remaining)
            </button>
          )}

          <p className="pb-2 text-center text-[11px] text-muted-foreground">
            Showing {visible.length} of {filtered.length} subdomains
          </p>
        </>
      )}
    </div>
  );
}
