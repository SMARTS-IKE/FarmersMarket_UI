import { createRoute } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import DashboardPage from '../pages/adminPages/AdminDashboardPage';
import AdminUsersPage from '../pages/adminPages/users/AdminUsersPage';
import UserPage from '../pages/userPages/UserPage';
import AdminSellersPage from '../pages/adminPages/sellers/AdminSellersPage';
import SellerPage from '../pages/adminPages/sellers/SellerPage';
import AdminMarketsPage from '../pages/adminPages/markets/AdminMarketsPage';
import AdminMarketCreatePage from '../pages/adminPages/markets/AdminMarketCreatePage';
import AdminMarketDetailPage from '../pages/adminPages/markets/AdminMarketDetailPage';
import AdminReportsPage from '../pages/adminPages/AdminReportsPage';
import AdminFeesPaymentsPage from '../pages/adminPages/FeesAndPayments/AdminFeesPaymentsPage';
import AdminRequestsPage from '../pages/adminPages/requests/AdminRequestsPage';
import DesignRequestFormPage from '../pages/adminPages/requests/DesignRequestFormPage';
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

export const sellerDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/sellers/$sellerId',
  component: SellerPage,
});

export const marketsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/markets',
  component: AdminMarketsPage,
});

export const marketCreateRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/markets/new',
  component: AdminMarketCreatePage,
});

export const marketDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/markets/$marketId',
  component: AdminMarketDetailPage,
});

export const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/reports',
  component: AdminReportsPage,
});

export const feesPaymentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/fees-payments',
  component: AdminFeesPaymentsPage,
});

export const requestsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests',
  component: AdminRequestsPage,
});

export const designRequestFormRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests/design-form',
  component: DesignRequestFormPage,
});

export const designRequestFormEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests/design-form/$requestFormId',
  component: DesignRequestFormPage,
});

export const adminRouteTree = protectedRoute.addChildren([
  dashboardRoute,
  usersRoute,
  userDetailRoute,
  feesPaymentsRoute,
  sellersRoute,
  sellerDetailRoute,
  marketsRoute,
  marketCreateRoute,
  marketDetailRoute,
  reportsRoute,
  requestsRoute,
  designRequestFormRoute,
  designRequestFormEditRoute,
]);