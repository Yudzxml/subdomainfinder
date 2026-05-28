import { create } from 'zustand';
import { SubdomainResult, ScanStats, FilterOptions, ViewMode, ScanLog, ScanProgress } from '@/types/scan';

interface ScanState {
  // Scan data
  domain: string;
  subdomains: SubdomainResult[];
  stats: ScanStats | null;
  filteredSubdomains: SubdomainResult[];

  // Scan state
  isScanning: boolean;
  scanProgress: number;
  scanPhase: string;
  scanDuration: number;
  scanLogs: ScanLog[];

  // Filters
  filters: FilterOptions;
  searchQuery: string;

  // UI state
  viewMode: ViewMode;
  selectedSubdomain: SubdomainResult | null;
  isDetailOpen: boolean;
  isCommandPaletteOpen: boolean;

  // History & favorites
  recentScans: string[];
  favoriteDomains: string[];

  // Actions
  setDomain: (domain: string) => void;
  setSubdomains: (subdomains: SubdomainResult[]) => void;
  setStats: (stats: ScanStats) => void;
  setIsScanning: (isScanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setScanPhase: (phase: string) => void;
  setScanDuration: (duration: number) => void;
  setScanLogs: (logs: ScanLog[]) => void;
  addScanLog: (log: ScanLog) => void;
  setFilters: (filters: FilterOptions) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedSubdomain: (subdomain: SubdomainResult | null) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  resetScan: () => void;
  applyFilters: () => void;
  exportData: (format: 'json' | 'csv' | 'txt') => void;
  addToFavorites: (domain: string) => void;
  removeFromFavorites: (domain: string) => void;
  addToRecent: (domain: string) => void;
  clearRecent: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  // Initial state
  domain: '',
  subdomains: [],
  stats: null,
  filteredSubdomains: [],
  isScanning: false,
  scanProgress: 0,
  scanPhase: '',
  scanDuration: 0,
  scanLogs: [],
  filters: {},
  searchQuery: '',
  viewMode: 'list',
  selectedSubdomain: null,
  isDetailOpen: false,
  isCommandPaletteOpen: false,
  recentScans: [],
  favoriteDomains: [],

  // Actions
  setDomain: (domain) => set({ domain }),

  setSubdomains: (subdomains) => {
    set({ subdomains });
    get().applyFilters();
  },

  setStats: (stats) => set({ stats }),

  setIsScanning: (isScanning) => set({ isScanning }),

  setScanProgress: (progress) => set({ scanProgress: progress }),

  setScanPhase: (phase) => set({ scanPhase: phase }),

  setScanDuration: (duration) => set({ scanDuration: duration }),

  setScanLogs: (logs) => set({ scanLogs: logs }),

  addScanLog: (log) => set((state) => ({ scanLogs: [...state.scanLogs, log] })),

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setSelectedSubdomain: (subdomain) => set({ selectedSubdomain: subdomain }),

  setIsDetailOpen: (isOpen) => set({ isDetailOpen: isOpen }),

  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

  resetScan: () =>
    set({
      domain: '',
      subdomains: [],
      stats: null,
      filteredSubdomains: [],
      isScanning: false,
      scanProgress: 0,
      scanPhase: '',
      scanDuration: 0,
      scanLogs: [],
      selectedSubdomain: null,
      isDetailOpen: false,
      filters: {},
      searchQuery: '',
    }),

  applyFilters: () => {
    const { subdomains, filters, searchQuery } = get();
    let filtered = [...subdomains];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.subdomain.toLowerCase().includes(query) ||
          s.title.toLowerCase().includes(query) ||
          s.ipAddress.toLowerCase().includes(query) ||
          s.techStack.some(t => t.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.cloudflare !== undefined) {
      filtered = filtered.filter((s) => s.cloudflare === filters.cloudflare);
    }

    if (filters.alive !== undefined) {
      filtered = filtered.filter((s) => s.alive === filters.alive);
    }

    if (filters.dead !== undefined) {
      filtered = filtered.filter((s) => !s.alive === filters.dead);
    }

    if (filters.status200) {
      filtered = filtered.filter((s) => s.status === 200);
    }

    if (filters.riskLevel) {
      filtered = filtered.filter((s) => s.riskLevel === filters.riskLevel);
    }

    if (filters.highRisk) {
      filtered = filtered.filter((s) => s.riskScore >= 50);
    }

    if (filters.adminPortal) {
      filtered = filtered.filter(
        (s) =>
          /admin|login|portal|dashboard|cpanel|webmail/i.test(s.subdomain)
      );
    }

    if (filters.waf) {
      filtered = filtered.filter((s) => s.waf.includes(filters.waf!));
    }

    if (filters.sslValid !== undefined) {
      filtered = filtered.filter((s) => s.ssl === filters.sslValid);
    }

    set({ filteredSubdomains: filtered });
  },

  exportData: (format) => {
    const { filteredSubdomains } = get();
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(filteredSubdomains, null, 2);
        filename = 'subdomains.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = [
          'Subdomain',
          'Status',
          'Alive',
          'Response Time',
          'Title',
          'IP Address',
          'Server',
          'Cloudflare',
          'WAF',
          'Country',
          'Risk Score',
          'Risk Level',
          'SSL',
          'Tech Stack',
        ];
        const rows = filteredSubdomains.map((s) =>
          [
            s.subdomain,
            s.status,
            s.alive,
            s.responseTime,
            `"${s.title}"`,
            s.ipAddress,
            s.server,
            s.cloudflare,
            s.waf.join(';'),
            s.country,
            s.riskScore,
            s.riskLevel,
            s.ssl,
            s.techStack.join(';'),
          ].join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        filename = 'subdomains.csv';
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = filteredSubdomains.map((s) => s.subdomain).join('\n');
        filename = 'subdomains.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  addToFavorites: (domain) => {
    set((state) => ({
      favoriteDomains: state.favoriteDomains.includes(domain)
        ? state.favoriteDomains
        : [...state.favoriteDomains, domain],
    }));

    // Save to localStorage
    const favorites = get().favoriteDomains;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  },

  removeFromFavorites: (domain) => {
    set((state) => ({
      favoriteDomains: state.favoriteDomains.filter((d) => d !== domain),
    }));

    const favorites = get().favoriteDomains;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  },

  addToRecent: (domain) => {
    set((state) => {
      const recent = [domain, ...state.recentScans.filter((d) => d !== domain)].slice(0, 10);
      localStorage.setItem('recentScans', JSON.stringify(recent));
      return { recentScans: recent };
    });
  },

  clearRecent: () => {
    set({ recentScans: [] });
    localStorage.removeItem('recentScans');
  },
}));

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const favorites = localStorage.getItem('favorites');
  const recent = localStorage.getItem('recentScans');

  if (favorites) {
    useScanStore.setState({ favoriteDomains: JSON.parse(favorites) });
  }

  if (recent) {
    useScanStore.setState({ recentScans: JSON.parse(recent) });
  }
}