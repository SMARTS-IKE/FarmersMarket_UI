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
    const roles = useAuthStore.getState().user?.roles ?? [];
    const isUser = roles[0] === 'User_Access';
    throw redirect({ to: isUser ? '/users' : '/admin' });
  }
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const roles = useAuthStore.getState().user?.roles ?? [];
    const isUser = roles[0] === 'User_Access';
    throw redirect({ to: isUser ? '/users' : '/admin' });
  },
});