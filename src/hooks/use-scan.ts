import { useState, useCallback } from 'react';
import { useScanStore } from '@/store/scan-store';

interface UseScanReturn {
  scanDomain: (domain: string) => Promise<void>;
  isScanning: boolean;
  progress: number;
  phase: string;
  error: string | null;
}

async function ensureSession(): Promise<string | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.sessionId) {
        // Store in localStorage as fallback (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('session_token', data.sessionId);
        }
        return data.sessionId;
      }
    }
    return null;
  } catch (error) {
    console.error('Session initialization error:', error);
    return null;
  }
}

export function useScan(): UseScanReturn {
  const [error, setError] = useState<string | null>(null);

  const isScanning = useScanStore((state) => state.isScanning);
  const setDomain = useScanStore((state) => state.setDomain);
  const setSubdomains = useScanStore((state) => state.setSubdomains);
  const setStats = useScanStore((state) => state.setStats);
  const setIsScanning = useScanStore((state) => state.setIsScanning);
  const setScanProgress = useScanStore((state) => state.setScanProgress);
  const setScanPhase = useScanStore((state) => state.setScanPhase);
  const setScanDuration = useScanStore((state) => state.setScanDuration);
  const setScanLogs = useScanStore((state) => state.setScanLogs);
  const addScanLog = useScanStore((state) => state.addScanLog);

  const progress = useScanStore((state) => state.scanProgress);
  const phase = useScanStore((state) => state.scanPhase);

  const scanDomain = useCallback(
    async (domain: string) => {
      setError(null);
      setDomain(domain);
      setIsScanning(true);
      setScanProgress(0);
      setScanPhase('Initializing...');
      setScanLogs([]);

      addScanLog({
        timestamp: new Date().toISOString(),
        phase: 'enumeration',
        message: `Preparing scan for ${domain}...`,
      });

      try {
        // Ensure session exists before scanning
        addScanLog({
          timestamp: new Date().toISOString(),
          phase: 'session',
          message: 'Establishing secure session...',
        });

        let sessionToken = await ensureSession();
        if (!sessionToken) {
          // Try to get from localStorage as fallback (browser only)
          if (typeof window !== 'undefined') {
            sessionToken = localStorage.getItem('session_token');
          }
        }

        if (!sessionToken) {
          throw new Error('Failed to establish session. Please try again.');
        }

        addScanLog({
          timestamp: new Date().toISOString(),
          phase: 'session',
          message: 'Session established successfully',
        });

        // Perform scan with both credentials and session header
        const response = await fetch(
          `/api/scan?domain=${encodeURIComponent(domain)}&includeDNS=true&includeSSL=true&includeHeaders=true`,
          {
            credentials: 'include', // Include cookies
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Token': sessionToken, // Also send via header as fallback
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Scan failed');
        }

        const data = await response.json();

        if (data.success) {
          setSubdomains(data.subdomains);
          setStats(data.stats);
          setScanDuration(data.duration);
          setScanProgress(100);
          setScanPhase('Complete!');
          setScanLogs(data.logs || []);

          addScanLog({
            timestamp: new Date().toISOString(),
            phase: 'finalizing',
            message: `Scan completed! Found ${data.stats?.total || 0} subdomains.`,
          });
        } else {
          throw new Error(data.message || 'Scan failed');
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred during scanning';
        setError(errorMessage);
        setScanPhase('Error');

        addScanLog({
          timestamp: new Date().toISOString(),
          phase: 'error',
          message: errorMessage,
        });
      } finally {
        setIsScanning(false);
      }
    },
    [
      setDomain,
      setSubdomains,
      setStats,
      setIsScanning,
      setScanProgress,
      setScanPhase,
      setScanDuration,
      setScanLogs,
      addScanLog,
    ]
  );

  return {
    scanDomain,
    isScanning,
    progress,
    phase,
    error,
  };
}