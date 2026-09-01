'use client';

import { useState, useEffect, useRef } from 'react';

interface SessionState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initializes a secure session once per app lifetime.
 * The token is mirrored to localStorage so the scan API can fall back
 * to the X-Session-Token header in restricted cookie environments.
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({
    token: null,
    loading: true,
    error: null,
  });
  const initializingRef = useRef(false);

  const initializeSession = async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.sessionId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('session_token', data.sessionId);
        }
        setState({ token: data.sessionId, loading: false, error: null });
      } else {
        throw new Error(data.message || 'Failed to initialize session');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Session initialization failed';
      setState({ token: null, loading: false, error: errorMessage });
      initializingRef.current = false; // allow retry
    }
  };

  const refreshSession = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
    }
    initializingRef.current = false;
    await initializeSession();
  };

  useEffect(() => {
    initializeSession();
  }, []);

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    initialized: !!state.token,
    refreshSession,
  };
}
