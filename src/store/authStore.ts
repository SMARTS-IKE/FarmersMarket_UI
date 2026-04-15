import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../models/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (data: AuthResponse) =>
        set({ user: data.user ?? null, token: data.token ?? null }),

      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth',
    }
  )
);
