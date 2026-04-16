import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import App from '../App';
import { useAuthStore } from '../store/authStore';

export const rootRoute = createRootRoute({ component: App });

export function requireAuth() {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw redirect({ to: '/auth/login' });
  }
}

export function redirectIfAuthed() {
  const token = useAuthStore.getState().token;
  if (token) {
    throw redirect({ to: '/admin' });
  }
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/admin' });
  },
});