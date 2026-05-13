import { createRoute } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import AdminDashboardPage from '../pages/adminPages/AdminDashboardPage';
import AdminMarketsPage from '../pages/adminPages/markets/AdminMarketsPage';
import AdminMarketDetailPage from '../pages/adminPages/markets/AdminMarketDetailPage';
import UserRequestsPage from '../pages/adminPages/requests/UserRequestsPage';
import UserMarketPeriodDetailsPage from '../pages/adminPages/requests/UserMarketPeriodDetailsPage';
import { requireAuth, rootRoute } from './baseRoutes';

export const userProtectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'user-protected',
  beforeLoad: requireAuth,
  component: RoleBasedLayout,
});

export const userDashboardRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users',
  component: AdminDashboardPage,
});

export const userMarketsRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/markets',
  component: AdminMarketsPage,
});

export const userMarketDetailRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/markets/$marketId',
  component: AdminMarketDetailPage,
});

export const userRequestsRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/requests',
  component: UserRequestsPage,
});

export const userMarketPeriodDetailsRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/requests/periods/$periodId',
  component: UserMarketPeriodDetailsPage,
});

export const userRouteTree = userProtectedRoute.addChildren([
  userDashboardRoute,
  userMarketsRoute,
  userMarketDetailRoute,
  userRequestsRoute,
  userMarketPeriodDetailsRoute,
]);
