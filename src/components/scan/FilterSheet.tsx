'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { FilterOptions, RiskLevel } from '@/types/scan';

const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

const WAF_OPTIONS = ['Cloudflare', 'Akamai', 'AWS CloudFront', 'Fastly', 'Imperva', 'Sucuri'];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-all ${
        active
          ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
          : 'bg-white/[0.04] text-muted-foreground ring-white/10 hover:text-foreground'
      }`}
    >
      {children}
    </motion.button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterSheet() {
  const isOpen = useScanStore((s) => s.isFilterOpen);
  const setOpen = useScanStore((s) => s.setIsFilterOpen);
  const filters = useScanStore((s) => s.filters);
  const setFilters = useScanStore((s) => s.setFilters);
  const clearFilters = useScanStore((s) => s.clearFilters);
  const searchQuery = useScanStore((s) => s.searchQuery);
  const setSearchQuery = useScanStore((s) => s.setSearchQuery);
  const filteredCount = useScanStore((s) => s.filteredSubdomains.length);

  const toggle = <K extends keyof FilterOptions>(key: K, value?: FilterOptions[K]) => {
    const current = filters[key];
    const next: FilterOptions = { ...filters };
    if (key === 'alive' || key === 'cloudflare' || key === 'sslValid') {
      // tri-state toggles: undefined -> true -> false -> undefined
      if (current === undefined) (next[key] as boolean) = true;
      else if (current === true) (next[key] as boolean) = false;
      else delete next[key];
    } else if (current === value || (current !== undefined && value === undefined)) {
      delete next[key];
    } else if (value !== undefined) {
      (next[key] as unknown) = value;
    } else {
      next[key] = !current as FilterOptions[K];
    }
    setFilters(next);
  };

  const hasFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

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
            className="glass-strong fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[80vh] max-w-2xl overflow-hidden rounded-t-3xl pb-safe sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label="Filter results"
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="max-h-[calc(80vh-24px)] overflow-y-auto scrollbar-thin px-5 pb-8 pt-4 sm:px-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
                    <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Filters</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {filteredCount} result{filteredCount !== 1 ? 's' : ''} match
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasFilters && (
                    <button
                      onClick={() => clearFilters()}
                      className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Search
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Subdomain, title, IP, or tech…"
                  className="w-full rounded-xl border border-border bg-black/30 px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-5">
                <Section title="Status">
                  <FilterChip
                    active={filters.alive === true}
                    onClick={() => toggle('alive', true)}
                  >
                    Alive only
                  </FilterChip>
                  <FilterChip
                    active={filters.status200}
                    onClick={() => toggle('status200')}
                  >
                    Status 200
                  </FilterChip>
                  <FilterChip
                    active={filters.adminPortal}
                    onClick={() => toggle('adminPortal')}
                  >
                    Admin portals
                  </FilterChip>
                </Section>

                <Section title="Security">
                  <FilterChip
                    active={filters.cloudflare === true}
                    onClick={() => toggle('cloudflare', true)}
                  >
                    Cloudflare
                  </FilterChip>
                  <FilterChip
                    active={filters.sslValid === true}
                    onClick={() => toggle('sslValid', true)}
                  >
                    Valid SSL
                  </FilterChip>
                  <FilterChip
                    active={filters.highRisk}
                    onClick={() => toggle('highRisk')}
                  >
                    High risk (50+)
                  </FilterChip>
                </Section>

                <Section title="Risk Level">
                  {RISK_LEVELS.map((level) => (
                    <FilterChip
                      key={level}
                      active={filters.riskLevel === level}
                      onClick={() => toggle('riskLevel', level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </FilterChip>
                  ))}
                </Section>

                <Section title="WAF">
                  {WAF_OPTIONS.map((waf) => (
                    <FilterChip
                      key={waf}
                      active={filters.waf === waf}
                      onClick={() => toggle('waf', waf)}
                    >
                      {waf}
                    </FilterChip>
                  ))}
                </Section>
              </div>

              {/* Apply */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(false)}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25"
              >
                Show {filteredCount} Result{filteredCount !== 1 ? 's' : ''}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
