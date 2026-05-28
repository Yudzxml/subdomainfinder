'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import { Search, Clock, Star, ExternalLink, X, Plus } from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const {
    recentScans,
    favoriteDomains,
    domain,
    setDomain,
    addToRecent,
    addToFavorites,
    removeFromFavorites,
  } = useScanStore();

  // Toggle command palette with Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleScan = (selectedDomain: string) => {
    setDomain(selectedDomain);
    addToRecent(selectedDomain);
    setOpen(false);
    // Trigger scan
    const scanEvent = new CustomEvent('startScan', { detail: { domain: selectedDomain } });
    window.dispatchEvent(scanEvent);
  };

  const toggleFavorite = (domainToToggle: string) => {
    if (favoriteDomains.includes(domainToToggle)) {
      removeFromFavorites(domainToToggle);
    } else {
      addToFavorites(domainToToggle);
    }
  };

  const allDomains = [...new Set([...recentScans, ...favoriteDomains])];

  const filteredDomains = allDomains.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl bg-black/95 border-gray-800">
        <Command className="rounded-lg">
          <div className="flex items-center border-b border-gray-800 px-4">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <Command.Input
              placeholder="Search or enter a domain..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"
            />
            <kbd className="pointer-events-none ml-auto flex h-5 select-none items-center gap-1 rounded border border-gray-700 bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {search && (
              <Command.Group heading="New Scan">
                <Command.Item
                  onSelect={() => handleScan(search)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-800 cursor-pointer text-white"
                >
                  <Plus className="w-4 h-4 text-green-400" />
                  <span>Scan {search}</span>
                </Command.Item>
              </Command.Group>
            )}

            {filteredDomains.length > 0 && (
              <>
                {favoriteDomains.filter((d) => filteredDomains.includes(d)).length > 0 && (
                  <Command.Group heading="Favorites">
                    {favoriteDomains
                      .filter((d) => filteredDomains.includes(d))
                      .map((domainItem) => (
                        <Command.Item
                          key={domainItem}
                          onSelect={() => handleScan(domainItem)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-800 cursor-pointer text-white group"
                        >
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="flex-1">{domainItem}</span>
                          <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100" />
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}

                {recentScans.filter((d) => filteredDomains.includes(d)).length > 0 && (
                  <Command.Group heading="Recent Scans">
                    {recentScans
                      .filter((d) => filteredDomains.includes(d))
                      .map((domainItem) => (
                        <Command.Item
                          key={domainItem}
                          onSelect={() => handleScan(domainItem)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-800 cursor-pointer text-white group"
                        >
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="flex-1">{domainItem}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(domainItem);
                            }}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            {favoriteDomains.includes(domainItem) ? (
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <Star className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}
              </>
            )}

            {!search && filteredDomains.length === 0 && (
              <Command.Empty className="py-8 text-center text-sm text-gray-500">
                No recent scans or favorites
              </Command.Empty>
            )}

            {search && filteredDomains.length === 0 && (
              <Command.Empty className="py-8 text-center text-sm text-gray-500">
                No results found for "{search}"
              </Command.Empty>
            )}
          </Command.List>

          <div className="border-t border-gray-800 p-3 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="font-mono bg-gray-800 px-1.5 py-0.5 rounded">Enter</kbd>
                to scan
              </span>
              <span>
                <kbd className="font-mono bg-gray-800 px-1.5 py-0.5 rounded">↑↓</kbd>
                to navigate
              </span>
              <span>
                <kbd className="font-mono bg-gray-800 px-1.5 py-0.5 rounded">Esc</kbd>
                to close
              </span>
            </div>
            <span>Press <kbd className="font-mono bg-gray-800 px-1.5 py-0.5 rounded">⌘K</kbd> to open</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}