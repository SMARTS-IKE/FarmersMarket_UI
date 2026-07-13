import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';
// Small local JWT decoder fallback to avoid import/export mismatches with jwt-decode
function safeJwtDecode<T = any>(token: string): T {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {} as T;
    let payload = parts[1];

    // Handle base64url (RFC 7515) -> convert to base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' to make length a multiple of 4
    const pad = payload.length % 4;
    if (pad === 2) payload += '==';
    else if (pad === 3) payload += '=';
    else if (pad === 1) {
      // invalid base64 string
      throw new Error('Invalid base64 string in token payload');
    }

    // atob is available in browser environments; decode UTF-8 safely
    const decoded = atob(payload);
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(json) as T;
  } catch (e) {
    console.error('safeJwtDecode error', e);
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
    const localAuth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
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
        // Accept tokens from different backend shapes: `accessToken`, `token`, or `access_token`.
        const maybeToken = (data as any).accessToken ?? (data as any).token ?? (data as any).access_token ?? null;
        try {
          if (maybeToken) {
            const decoded = safeJwtDecode<JWTPayload>(maybeToken);
            const role =
              decoded.role ||
              decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

              console.log(decoded);

            const firstName = decoded.firstName ?? '';
            const lastName = decoded.lastName ?? '';

            const user: User = {
              id: decoded.userId || decoded.sub,
              email: decoded.email ?? null,
              firstName,
              lastName,
              name: `${firstName} ${lastName}`.trim() || decoded.name || null,
              role: Array.isArray(role) ? role[0] : (role as string),
              status: decoded.status,
            };

            set({
              user,
              token: maybeToken,
              email: user.email ?? null,
              role: user.role ?? null,
            });
            return;
          }

          // If no token is present, fall back to service-provided user fields
          set({
            user: data.user ?? null,
            token: null,
            email: data.email ?? data.user?.email ?? null,
            role: data.role ?? data.roles?.[0] ?? data.user?.role ?? null,
          });
        } catch (error) {
          console.error('Failed to decode token:', error);
          // Final fallback using whatever was provided
          set({
            user: data.user ?? null,
            token: maybeToken ?? null,
            email: data.email ?? data.user?.email ?? null,
            role: data.role ?? data.roles?.[0] ?? data.user?.role ?? null,
          });
        }
      },

      isAdmin: () => {
        const role = get().role;
        if (!role) return false;

        const roles = Array.isArray(role) ? role : [role];

        return roles.some((r) => {
          const norm = String(r ?? '').trim().toLowerCase();
          const mappedAdmin = (USER_ROLE_MAPPING.ADMIN ?? '').trim().toLowerCase();

          // Accept localized admin label, canonical 'Admin_Access', or simple 'admin' variants
          if (norm === mappedAdmin) return true;
          if (norm === 'admin_access') return true;
          if (norm === 'admin') return true;
          // Fallback: contains 'admin'
          return norm.includes('admin');
        });
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
