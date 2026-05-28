import { useState, useEffect } from 'react';

interface SessionState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    token: null,
    loading: false,
    error: null,
  });

  const initializeSession = async () => {
    setSessionState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.sessionId) {
        // Store session token in localStorage as fallback (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('session_token', data.sessionId);
        }
        setSessionState({
          token: data.sessionId,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(data.message || 'Failed to initialize session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session initialization failed';
      setSessionState({
        token: null,
        loading: false,
        error: errorMessage,
      });
    }
  };

  const refreshSession = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
    }
    await initializeSession();
  };

  const getSessionHeaders = (): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionState.token || '',
    };
  };

  useEffect(() => {
    // Auto-initialize session if not present
    if (!sessionState.token) {
      initializeSession();
    }
  }, []);

  return {
    token: sessionState.token,
    loading: sessionState.loading,
    error: sessionState.error,
    initialized: !!sessionState.token,
    refreshSession,
    getSessionHeaders,
  };
}