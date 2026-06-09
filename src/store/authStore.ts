import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
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
          const decoded = jwtDecode<JWTPayload>(data.accessToken);
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
            status: decoded.status,
            aspNetUserId: decoded.aspNetUserId,
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
