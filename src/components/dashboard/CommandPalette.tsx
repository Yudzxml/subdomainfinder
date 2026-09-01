'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Clock, Star, Zap, Plus, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scan-store';
import { useScan, isValidDomainFormat } from '@/hooks/use-scan';
import { useToast } from '@/hooks/use-toast';

export function CommandPalette() {
  const open = useScanStore((s) => s.isCommandPaletteOpen);
  const setOpen = useScanStore((s) => s.setCommandPaletteOpen);
  const recentScans = useScanStore((s) => s.recentScans);
  const favoriteDomains = useScanStore((s) => s.favoriteDomains);
  const toggleFavorite = useScanStore((s) => s.toggleFavorite);
  const { scanDomain } = useScan();
  const { toast } = useToast();

  const [search, setSearch] = useState('');

  // Toggle with ⌘K / Ctrl+K or "/" — ignore when typing in inputs
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && search.length === 0)) {
        const target = e.target as HTMLElement;
        if (
          target.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          if (!(e.key === 'k' && (e.metaKey || e.ctrlKey))) return;
        }
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen, search.length]);

  const handleScan = async (rawDomain: string) => {
    const domain = rawDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
    if (!isValidDomainFormat(domain)) {
      toast({
        title: 'Invalid domain',
        description: 'Enter a valid domain with its extension — e.g. example.com',
        variant: 'destructive',
      });
      return;
    }
    setOpen(false);
    setSearch('');
    useScanStore.getState().resetScan();
    useScanStore.getState().setActiveTab('scan');
    const ok = await scanDomain(domain);
    if (ok) {
      useScanStore.getState().setActiveTab('results');
      toast({
        title: 'Scan complete',
        description: `Found ${useScanStore.getState().stats?.total ?? 0} subdomains for ${domain}`,
      });
    } else {
      const err = useScanStore.getState().scanError;
      if (err) {
        toast({ title: 'Scan failed', description: err, variant: 'destructive' });
      }
    }
  };

  const cleanSearch = search.replace(/^(https?:\/\/)?(www\.)?/, '').trim();
  const showScanAction = cleanSearch.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm sm:pt-[16vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            <Command
              loop
              className="glass-strong overflow-hidden rounded-2xl shadow-2xl"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="Type a domain to scan…"
                  value={search}
                  onValueChange={setSearch}
                  className="h-13 w-full bg-transparent py-4 font-mono text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground/60"
                />
                <kbd className="shrink-0 rounded-md border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[380px] overflow-y-auto scrollbar-thin p-2">
                {/* Direct scan action */}
                {showScanAction && (
                  <Command.Group heading="Scan">
                    <Command.Item
                      value={`scan ${cleanSearch}`}
                      onSelect={() => handleScan(cleanSearch)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground data-[selected=true]:bg-emerald-500/10"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
                        <Zap className="h-4 w-4 text-emerald-400" />
                      </span>
                      <span className="flex-1">
                        Scan <span className="font-mono font-semibold">{cleanSearch}</span>
                      </span>
                      {!isValidDomainFormat(cleanSearch) && (
                        <span className="text-[10px] text-amber-400">needs extension</span>
                      )}
                    </Command.Item>
                  </Command.Group>
                )}

                {/* Favorites */}
                {favoriteDomains.length > 0 && (
                  <Command.Group heading="Favorites">
                    {favoriteDomains
                      .filter((d) => !search || d.includes(cleanSearch))
                      .map((d) => (
                        <Command.Item
                          key={`fav-${d}`}
                          value={`favorite ${d}`}
                          onSelect={() => handleScan(d)}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground data-[selected=true]:bg-white/5"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          </span>
                          <span className="flex-1 font-mono">{d}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(d);
                            }}
                            className="rounded-md px-2 py-1 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 data-[selected=true]:opacity-100"
                          >
                            Remove
                          </button>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}

                {/* Recent */}
                {recentScans.filter((r) => !favoriteDomains.includes(r.domain)).length > 0 && (
                  <Command.Group heading="Recent scans">
                    {recentScans
                      .filter((r) => !favoriteDomains.includes(r.domain) && (!search || r.domain.includes(cleanSearch)))
                      .map((r) => (
                        <Command.Item
                          key={`recent-${r.domain}`}
                          value={`recent ${r.domain}`}
                          onSelect={() => handleScan(r.domain)}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground data-[selected=true]:bg-white/5"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <span className="flex-1 font-mono">{r.domain}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(r.domain);
                            }}
                            className="rounded-md px-2 py-1 text-[10px] text-muted-foreground opacity-0 transition-all hover:text-amber-400 group-hover:opacity-100 data-[selected=true]:opacity-100"
                          >
                            ★ Favorite
                          </button>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}

                {/* Empty states */}
                {!showScanAction && favoriteDomains.length === 0 && recentScans.length === 0 && (
                  <Command.Empty className="flex flex-col items-center gap-2 py-10 text-center">
                    <Radar className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Type a domain to start scanning
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      e.g. example.com
                    </p>
                  </Command.Empty>
                )}
                {showScanAction && !isValidDomainFormat(cleanSearch) && favoriteDomains.length === 0 && recentScans.length === 0 && (
                  <Command.Empty className="py-8 text-center text-xs text-amber-400">
                    Domains need an extension — e.g. example.com
                  </Command.Empty>
                )}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-white/5 px-1 font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-white/5 px-1 font-mono">↵</kbd>
                    scan
                  </span>
                </div>
                <span>SubScan Command</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
