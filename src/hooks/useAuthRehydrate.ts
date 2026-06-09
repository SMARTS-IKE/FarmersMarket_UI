import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Rehydrate auth from localStorage on app startup if a remembered session exists.
 * Call this hook once at the root level (e.g., in App.tsx).
 */
export function useAuthRehydrate() {
  useEffect(() => {
    const state = useAuthStore.getState();
    const token = state.token;

    // Only rehydrate if no active session and localStorage has a remembered auth
    if (!token) {
      try {
        const localAuth = localStorage.getItem('auth');
        if (localAuth) {
          const parsed = JSON.parse(localAuth);
          // localStorage stores the full zustand state shape
          // Reconstruct AuthResponse to pass to setAuth
          const authResponse = {
            accessToken: parsed.token,
            email: parsed.email,
            user: parsed.user,
            role: parsed.role,
          };
          state.setAuth(authResponse as any);
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
  }, []);
}
