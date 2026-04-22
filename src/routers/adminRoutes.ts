import { createRoute } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import DashboardPage from '../pages/adminPages/AdminDashboardPage';
import AdminUsersPage from '../pages/adminPages/users/AdminUsersPage';
import UserPage from '../pages/adminPages/users/UserPage';
import AdminSellersPage from '../pages/adminPages/sellers/AdminSellersPage';
import AdminMarketsPage from '../pages/adminPages/markets/AdminMarketsPage';
import AdminReportsPage from '../pages/adminPages/AdminReportsPage';
import AdminRequestsPage from '../pages/adminPages/AdminRequestsPage';
import { requireAuth, rootRoute } from './baseRoutes';

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: requireAuth,
  component: RoleBasedLayout,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin',
  component: DashboardPage,
});

export const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/users',
  component: AdminUsersPage,
});

export const userDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/users/$id',
  component: UserPage,
});

export const sellersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/sellers',
  component: AdminSellersPage,
});

export const marketsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/markets',
  component: AdminMarketsPage,
});

export const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/reports',
  component: AdminReportsPage,
});

export const requestsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests',
  component: AdminRequestsPage,
});

export const adminRouteTree = protectedRoute.addChildren([
  dashboardRoute,
  usersRoute,
  userDetailRoute,
  sellersRoute,
  marketsRoute,
  reportsRoute,
  requestsRoute,
]);