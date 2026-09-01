'use client';

import { useRef, useState, useCallback } from 'react';
import { useScanStore } from '@/store/scan-store';
import { ScanLog } from '@/types/scan';

interface UseScanReturn {
  scanDomain: (domain: string, forceRefresh?: boolean) => Promise<boolean>;
  cancelScan: () => void;
  isScanning: boolean;
  progress: number;
  phase: string;
  error: string | null;
}

/** Basic domain sanity check before hitting the API. */
export function isValidDomainFormat(domain: string): boolean {
  const clean = domain.replace(/^(https?:\/\/)?/, '').split('/')[0].trim();
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(clean);
}

async function ensureSession(): Promise<string | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.sessionId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('session_token', data.sessionId);
        }
        return data.sessionId;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function useScan(): UseScanReturn {
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isScanning = useScanStore((s) => s.isScanning);
  const progress = useScanStore((s) => s.scanProgress);
  const phase = useScanStore((s) => s.scanPhase);

  const scanDomain = useCallback(async (domain: string, forceRefresh = false): Promise<boolean> => {
    const store = useScanStore.getState();
    const {
      setDomain, setSubdomains, setStats, setIsScanning, setScanProgress,
      setScanPhase, setScanLogs, addScanLog, setScanError, setScanMeta,
      addToRecent,
    } = store;

    setError(null);
    setScanError(null);
    setDomain(domain);
    setIsScanning(true);
    setScanProgress(2);
    setScanPhase('Initializing');
    setScanLogs([]);

    // Smooth incremental progress while the server works
    const clearTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    clearTimer();
    timerRef.current = setInterval(() => {
      const s = useScanStore.getState();
      if (!s.isScanning) return clearTimer();
      // ease towards 92% — final jump happens on completion
      if (s.scanProgress < 92) {
        const step = s.scanProgress < 30 ? 1.6 : s.scanProgress < 60 ? 0.9 : 0.35;
        s.setScanProgress(Math.min(92, s.scanProgress + step));
      }
    }, 400);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isValidDomainFormat(domain)) {
        throw new Error(
          domain.includes('.') && domain.trim().length > 0
            ? 'Invalid domain format. Example: example.com'
            : 'Domain must have an extension (e.g., .com, .net, .org)'
        );
      }

      addScanLog({
        timestamp: new Date().toISOString(),
        phase: 'enumeration',
        message: `Preparing scan for ${domain}…`,
      });

      // Establish session
      setScanPhase('Establishing session');
      let sessionToken = await ensureSession();
      if (!sessionToken && typeof window !== 'undefined') {
        sessionToken = localStorage.getItem('session_token');
      }
      if (!sessionToken) {
        throw new Error('Failed to establish a secure session. Please try again.');
      }

      addScanLog({
        timestamp: new Date().toISOString(),
        phase: 'session',
        message: 'Secure session established',
      });

      setScanPhase('Enumerating subdomains');

      const response = await fetch(
        `/api/scan?domain=${encodeURIComponent(domain)}&includeDNS=true&includeSSL=true&includeHeaders=true${forceRefresh ? '&forceRefresh=true' : ''}`,
        {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Scan failed (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        setScanPhase('Finalizing results');
        setSubdomains(data.subdomains);
        setStats(data.stats);
        setScanMeta(data.duration ?? 0, !!data.cached);
        setScanProgress(100);
        setScanPhase('Complete');

        const logs: ScanLog[] = (data.logs || []).map((log: any) => ({
          timestamp: log.timestamp ?? new Date().toISOString(),
          phase: log.phase ?? 'enumeration',
          message: log.message,
        }));
        setScanLogs(logs);

        addToRecent({
          domain,
          scannedAt: Date.now(),
          totalFound: data.stats?.total ?? data.subdomains.length,
        });

        addScanLog({
          timestamp: new Date().toISOString(),
          phase: 'finalizing',
          message: `Scan completed — found ${data.stats?.total ?? 0} subdomains.`,
        });
        return true;
      }

      throw new Error(data.message || 'Scan failed');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setScanPhase('Cancelled');
        addScanLog({
          timestamp: new Date().toISOString(),
          phase: 'error',
          message: 'Scan cancelled by user',
        });
        return false;
      }
      const errorMessage = err.message || 'An error occurred during scanning';
      setError(errorMessage);
      setScanError(errorMessage);
      setScanPhase('Error');
      addScanLog({
        timestamp: new Date().toISOString(),
        phase: 'error',
        message: errorMessage,
      });
      return false;
    } finally {
      clearTimer();
      abortRef.current = null;
      setIsScanning(false);
    }
  }, []);

  const cancelScan = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { scanDomain, cancelScan, isScanning, progress, phase, error };
}
