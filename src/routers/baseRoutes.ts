import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import App from '../App';
import { useAuthStore } from '../store/authStore';
import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';

function normalizeRole(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function isUserRole(role: string | null | undefined, roles: string[] = []) {
  const normalizedUserRole = normalizeRole(USER_ROLE_MAPPING.USER);

  return (
    normalizeRole(role) === normalizedUserRole ||
    roles.some((entry) => normalizeRole(entry) === normalizedUserRole)
  );
}

export const rootRoute = createRootRoute({ component: App });

export function requireAuth() {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw redirect({ to: '/auth/login' });
  }
}

export function requireUserRole() {
  requireAuth();

  const { role, user } = useAuthStore.getState();

  if (!isUserRole(role, user?.roles)) {
    throw redirect({ to: '/admin' });
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