import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../models/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  email: string | null;
  role: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      email: null,
      role: null,

      setAuth: (data: AuthResponse) =>
        set({
          user: data.user
            ? {
                ...data.user,
                email: data.user.email ?? data.email ?? undefined,
                role: data.user.role ?? data.roles?.[0] ?? undefined,
                roles: data.user.roles ?? data.roles ?? undefined,
              }
            : data.email || data.roles?.length
              ? {
                  email: data.email,
                  role: data.roles?.[0],
                  roles: data.roles,
                }
              : null,
          token: data.token ?? null,
          email: data.email ?? data.user?.email ?? null,
          role: data.roles?.[0] ?? data.user?.role ?? data.user?.roles?.[0] ?? null,
        }),

      clearAuth: () => set({ user: null, token: null, email: null, role: null }),
    }),
    {
      name: 'auth',
    }
  )
);
