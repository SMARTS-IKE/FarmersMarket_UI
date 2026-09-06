import { createRoute, redirect } from '@tanstack/react-router';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import { redirectIfAuthed, rootRoute } from './baseRoutes';

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: redirectIfAuthed,
  component: AuthLayout,
});

export const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: LoginPage,
});

export const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/register',
  component: RegisterPage,
});

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
});

export const authIndexRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auth/login' });
  },
});

export const authRouteTree = authRoute.addChildren([
  authIndexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
]);