import { create } from 'zustand';

interface LoadingState {
  pendingRequests: number;
  isBlocked: boolean;
  block: () => void;
  unblock: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingRequests: 0,
  isBlocked: false,

  block: () =>
    set((state) => ({
      pendingRequests: state.pendingRequests + 1,
      isBlocked: true,
    })),

  unblock: () =>
    set((state) => {
      const pending = Math.max(0, state.pendingRequests - 1);
      return { pendingRequests: pending, isBlocked: pending > 0 };
    }),
}));
