import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import App from '../App';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';

// ─── Root route ─────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: App });

// ─── Auth guard helpers ──────────────────────────────────────────
function requireAuth() {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw redirect({ to: '/auth/login' });
  }
}

function redirectIfAuthed() {
  const token = useAuthStore.getState().token;
  if (token) {
    throw redirect({ to: '/dashboard' });
  }
}

// ─── /auth (layout parent) ───────────────────────────────────────
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: redirectIfAuthed,
  component: AuthLayout,
});

    // ─── /auth/login ────────────────────────────────────────────────
    const loginRoute = createRoute({
      getParentRoute: () => authRoute,
      path: '/login',
      component: LoginPage,
    });

    // ─── /auth/register ─────────────────────────────────────────────
    const registerRoute = createRoute({
      getParentRoute: () => authRoute,
      path: '/register',
      component: RegisterPage,
    });

    // ─── /auth (index → redirect to /auth/login) ────────────────────
    const authIndexRoute = createRoute({
      getParentRoute: () => authRoute,
      path: '/',
      beforeLoad: () => {
        throw redirect({ to: '/auth/login' });
      },
    });

// ─── /dashboard ─────────────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

// ─── / (index → redirect to /dashboard) ────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
});

// ─── Route tree ──────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute.addChildren([authIndexRoute, loginRoute, registerRoute]),
  dashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

