'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Client component to sync session from localStorage to cookies
 */
export function SessionSync() {
  useEffect(() => {
    async function checkAndSyncSession() {
      const storageKeys = Object.keys(localStorage).filter(key => key.includes('auth-token'));
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Check if cookies are set
        const hasCookies = document.cookie.includes('sb-') || document.cookie.includes('auth-token');

        if (!hasCookies) {
          // Manually set cookies from session
          const storageKey = storageKeys[0] || 'sb-auth-token';
          const sessionString = JSON.stringify(session);
          const encodedSession = encodeURIComponent(sessionString);

          document.cookie = `${storageKey}=${encodedSession}; path=/; max-age=3600; SameSite=Lax`;
          document.cookie = `sb-access-token=${encodeURIComponent(session.access_token)}; path=/; max-age=3600; SameSite=Lax`;
          document.cookie = `sb-refresh-token=${encodeURIComponent(session.refresh_token)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }

        // Note: DO NOT call refreshSession() here - it causes "Invalid Refresh Token: Already Used"
        // errors because the token is already being used by the proxy/middleware.
        // Supabase handles token refresh automatically.
      }
    }

    checkAndSyncSession();

    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('auth-token')) {
        checkAndSyncSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
