import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';
// Small local JWT decoder fallback to avoid import/export mismatches with jwt-decode
function safeJwtDecode<T = any>(token: string): T {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {} as T;
    const payload = parts[1];
    // atob is available in browser environments
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch (e) {
    return {} as T;
  }
}
import type { User, AuthResponse, JWTPayload } from '../models/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  email: string | null;
  role: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

// ── Try to restore remembered session from localStorage on store creation ──
function getInitialState() {
  const state: Pick<AuthState, 'user' | 'token' | 'email' | 'role'> = {
    user: null,
    token: null,
    email: null,
    role: null,
  };

  try {
    const localAuth = localStorage.getItem('auth');
    if (localAuth) {
      const parsed = JSON.parse(localAuth);
      // localStorage stores the flat state
      if (parsed.token) {
        state.token = parsed.token;
        state.email = parsed.email;
        state.user = parsed.user;
        state.role = parsed.role;
      }
    }
  } catch (e) {
    // ignore parsing errors
  }

  return state;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setAuth: (data: AuthResponse) => {
        try {
          const decoded = safeJwtDecode<JWTPayload>(data.accessToken);
          const role =
            decoded.role ||
            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

          const firstName = decoded.firstName ?? '';
          const lastName = decoded.lastName ?? '';

          const user: User = {
            id: decoded.userId || decoded.sub,
            email: decoded.email ?? null,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim() || decoded.name || null,
            role: Array.isArray(role) ? role[0] : (role as string),
            status: decoded.status
          };

          set({
            user,
            token: data.accessToken,
            email: user.email ?? null,
            role: user.role ?? null,
          });
        } catch (error) {
          console.error('Failed to decode token:', error);
          // Fallback if decoding fails but we have data
          set({
            user: data.user ?? null,
            token: data.accessToken ?? null,
            email: data.email ?? data.user?.email ?? null,
            role: data.role ?? data.roles?.[0] ?? data.user?.role ?? null,
          });
        }
      },

      isAdmin: () => {
        const role = get().role;
        return (role ?? '').trim().toLowerCase() === (USER_ROLE_MAPPING.ADMIN ?? '').trim().toLowerCase();
      },

      clearAuth: () => {
        try {
          sessionStorage.removeItem('auth');
          localStorage.removeItem('auth');
        } catch (e) {
          // ignore
        }
        set({ user: null, token: null, email: null, role: null });
      },
    }),
    {
      name: 'auth',
      // persist to sessionStorage; when 'Remember Me' is checked, LoginPage also copies to localStorage
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
