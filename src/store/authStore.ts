import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
    (set) => ({
      ...getInitialState(),

      setAuth: (data: AuthResponse) => {
        try {
          const decoded = safeJwtDecode<JWTPayload>(data.accessToken);
          const role =
            decoded.role ||
            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

          const user: User = {
            id: decoded.userId || decoded.sub,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            name: `${decoded.firstName} ${decoded.lastName}`.trim(),
            role: Array.isArray(role) ? role[0] : (role as string),
            status: decoded.status
          };

          console.log(user);

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
