import { create } from 'zustand';
import { SubdomainResult, ScanStats, FilterOptions, ViewMode, ScanLog } from '@/types/scan';

export interface RecentScanEntry {
  domain: string;
  scannedAt: number; // epoch ms
  totalFound: number;
}

interface ScanState {
  // Scan data
  domain: string;
  subdomains: SubdomainResult[];
  stats: ScanStats | null;
  filteredSubdomains: SubdomainResult[];
  scanDurationMs: number;
  fromCache: boolean;

  // Scan state
  isScanning: boolean;
  scanProgress: number;
  scanPhase: string;
  scanLogs: ScanLog[];
  scanError: string | null;

  // Filters & search
  filters: FilterOptions;
  searchQuery: string;

  // UI state
  activeTab: 'home' | 'scan' | 'results' | 'history' | 'settings';
  viewMode: 'list' | 'grid';
  selectedSubdomain: SubdomainResult | null;
  isDetailOpen: boolean;
  isFilterOpen: boolean;
  isScanModalOpen: boolean;
  isCommandPaletteOpen: boolean;

  // History & favorites (persisted)
  recentScans: RecentScanEntry[];
  favoriteDomains: string[];

  // Actions — data
  setDomain: (domain: string) => void;
  setSubdomains: (subdomains: SubdomainResult[]) => void;
  setStats: (stats: ScanStats) => void;
  setScanMeta: (durationMs: number, fromCache: boolean) => void;

  // Actions — scan lifecycle
  setIsScanning: (isScanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setScanPhase: (phase: string) => void;
  setScanLogs: (logs: ScanLog[]) => void;
  addScanLog: (log: ScanLog) => void;
  setScanError: (error: string | null) => void;
  resetScan: () => void;

  // Actions — filters
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;

  // Actions — UI
  setActiveTab: (tab: ScanState['activeTab']) => void;
  setViewMode: (mode: ScanState['viewMode']) => void;
  setSelectedSubdomain: (subdomain: SubdomainResult | null) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  setScanModalOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;

  // Actions — export & persistence
  exportData: (format: 'json' | 'csv' | 'txt') => void;
  addToFavorites: (domain: string) => void;
  removeFromFavorites: (domain: string) => void;
  toggleFavorite: (domain: string) => boolean;
  addToRecent: (entry: RecentScanEntry) => void;
  removeRecent: (domain: string) => void;
  clearRecent: () => void;
  clearAllData: () => void;

  // Helpers
  getActiveFilterCount: () => number;
}

const FAVORITES_KEY = 'subscan.favorites';
const RECENT_KEY = 'subscan.recent';

function persist(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore
  }
}

function readPersisted<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Escape a value for safe CSV output (handles quotes, commas, newlines). */
function csvEscape(value: unknown): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const useScanStore = create<ScanState>((set, get) => ({
  // Initial state
  domain: '',
  subdomains: [],
  stats: null,
  filteredSubdomains: [],
  scanDurationMs: 0,
  fromCache: false,
  isScanning: false,
  scanProgress: 0,
  scanPhase: '',
  scanLogs: [],
  scanError: null,
  filters: {},
  searchQuery: '',
  activeTab: 'home',
  viewMode: 'list',
  selectedSubdomain: null,
  isDetailOpen: false,
  isFilterOpen: false,
  isScanModalOpen: false,
  isCommandPaletteOpen: false,
  recentScans: [],
  favoriteDomains: [],

  // Data setters
  setDomain: (domain) => set({ domain }),

  setSubdomains: (subdomains) => {
    set({ subdomains });
    get().applyFilters();
  },

  setStats: (stats) => set({ stats }),

  setScanMeta: (durationMs, fromCache) => set({ scanDurationMs: durationMs, fromCache }),

  // Scan lifecycle
  setIsScanning: (isScanning) => set({ isScanning }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  setScanPhase: (phase) => set({ scanPhase: phase }),
  setScanLogs: (logs) => set({ scanLogs: logs }),
  addScanLog: (log) => set((state) => ({ scanLogs: [...state.scanLogs, log] })),
  setScanError: (error) => set({ scanError: error }),

  resetScan: () =>
    set({
      domain: '',
      subdomains: [],
      stats: null,
      filteredSubdomains: [],
      isScanning: false,
      scanProgress: 0,
      scanPhase: '',
      scanLogs: [],
      scanError: null,
      scanDurationMs: 0,
      fromCache: false,
      selectedSubdomain: null,
      isDetailOpen: false,
      filters: {},
      searchQuery: '',
    }),

  // Filters
  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: {}, searchQuery: '' });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  applyFilters: () => {
    const { subdomains, filters, searchQuery } = get();
    let filtered = [...subdomains];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.subdomain.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.ipAddress.toLowerCase().includes(q) ||
          s.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.alive !== undefined) {
      filtered = filtered.filter((s) => s.alive === filters.alive);
    }

    if (filters.cloudflare !== undefined) {
      filtered = filtered.filter((s) => s.cloudflare === filters.cloudflare);
    }

    if (filters.status200) {
      filtered = filtered.filter((s) => s.status === 200);
    }

    if (filters.highRisk) {
      filtered = filtered.filter((s) => s.riskScore >= 50);
    }

    if (filters.adminPortal) {
      filtered = filtered.filter((s) =>
        /admin|login|portal|dashboard|cpanel|webmail/i.test(s.subdomain)
      );
    }

    if (filters.riskLevel) {
      filtered = filtered.filter((s) => s.riskLevel === filters.riskLevel);
    }

    if (filters.waf) {
      filtered = filtered.filter((s) => s.waf.includes(filters.waf!));
    }

    if (filters.sslValid !== undefined) {
      filtered = filtered.filter((s) => s.ssl === filters.sslValid);
    }

    set({ filteredSubdomains: filtered });
  },

  // UI
  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedSubdomain: (subdomain) => set({ selectedSubdomain: subdomain }),
  setIsDetailOpen: (isOpen) => set({ isDetailOpen: isOpen }),
  setIsFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),
  setScanModalOpen: (isOpen) => set({ isScanModalOpen: isOpen }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

  // Export
  exportData: (format) => {
    const { filteredSubdomains, domain } = get();
    if (filteredSubdomains.length === 0) return;

    let content = '';
    let mimeType = '';
    const suffix = domain ? domain.replace(/[^a-z0-9.-]/gi, '_') : 'scan';
    let filename = `subscan-${suffix}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(filteredSubdomains, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
      case 'csv': {
        const headers = [
          'Subdomain', 'Status', 'Alive', 'Response Time (ms)', 'Title', 'IP Address',
          'Server', 'Cloudflare', 'WAF', 'Country', 'Risk Score', 'Risk Level',
          'SSL', 'Tech Stack',
        ];
        const rows = filteredSubdomains.map((s) =>
          [
            s.subdomain, s.status, s.alive, s.responseTime, s.title, s.ipAddress,
            s.server, s.cloudflare, s.waf.join('; '), s.country, s.riskScore,
            s.riskLevel, s.ssl, s.techStack.join('; '),
          ].map(csvEscape).join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
        break;
      }
      case 'txt':
        content = filteredSubdomains.map((s) => s.subdomain).join('\n');
        mimeType = 'text/plain';
        filename += '.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // Persistence
  addToFavorites: (domain) => {
    set((state) => {
      if (state.favoriteDomains.includes(domain)) return state;
      const favorites = [...state.favoriteDomains, domain];
      persist(FAVORITES_KEY, favorites);
      return { favoriteDomains: favorites };
    });
  },

  removeFromFavorites: (domain) => {
    set((state) => {
      const favorites = state.favoriteDomains.filter((d) => d !== domain);
      persist(FAVORITES_KEY, favorites);
      return { favoriteDomains: favorites };
    });
  },

  toggleFavorite: (domain) => {
    const { favoriteDomains, addToFavorites, removeFromFavorites } = get();
    const isFav = favoriteDomains.includes(domain);
    if (isFav) removeFromFavorites(domain);
    else addToFavorites(domain);
    return !isFav;
  },

  addToRecent: (entry) => {
    set((state) => {
      const recent = [
        entry,
        ...state.recentScans.filter((r) => r.domain !== entry.domain),
      ].slice(0, 20);
      persist(RECENT_KEY, recent);
      return { recentScans: recent };
    });
  },

  removeRecent: (domain) => {
    set((state) => {
      const recent = state.recentScans.filter((r) => r.domain !== domain);
      persist(RECENT_KEY, recent);
      return { recentScans: recent };
    });
  },

  clearRecent: () => {
    set({ recentScans: [] });
    if (typeof window !== 'undefined') localStorage.removeItem(RECENT_KEY);
  },

  clearAllData: () => {
    set({ recentScans: [], favoriteDomains: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_KEY);
      localStorage.removeItem(FAVORITES_KEY);
    }
  },

  getActiveFilterCount: () => {
    const { filters, searchQuery } = get();
    let count = 0;
    if (filters.alive !== undefined) count++;
    if (filters.cloudflare !== undefined) count++;
    if (filters.status200) count++;
    if (filters.highRisk) count++;
    if (filters.adminPortal) count++;
    if (filters.riskLevel) count++;
    if (filters.waf) count++;
    if (filters.sslValid !== undefined) count++;
    if (searchQuery.trim()) count++;
    return count;
  },
}));

// Hydrate persisted state on the client
if (typeof window !== 'undefined') {
  useScanStore.setState({
    favoriteDomains: readPersisted<string[]>(FAVORITES_KEY, []),
    recentScans: readPersisted<RecentScanEntry[]>(RECENT_KEY, []),
  });
}
