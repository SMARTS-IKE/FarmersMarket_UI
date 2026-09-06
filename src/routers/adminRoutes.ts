import { createElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import DashboardPage from '../pages/adminPages/AdminDashboardPage';
import AdminUsersPage from '../pages/adminPages/users/AdminUsersPage';
import UserCreation from '../pages/adminPages/users/AdminUserDetailedPage';
import UserPage from '../pages/userPages/UserPage';
import AdminSellersPage from '../pages/adminPages/sellers/AdminSellersPage';
import AdminSellerEditPage from '../pages/adminPages/sellers/AdminSellerEditPage';
import SellerPage from '../pages/adminPages/sellers/SellerPage';
import AdminSellerMarketPage from '../pages/adminPages/sellers/AdminSellerMarketPage';
import AdminMarketsPage from '../pages/adminPages/markets/AdminMarketsPage';
import AdminMarketCreatePage from '../pages/adminPages/markets/AdminMarketCreatePage';
import AdminMarketDetailPage from '../pages/adminPages/markets/AdminMarketDetailPage';
import AdminReportsPage from '../pages/adminPages/AdminReportsPage';
import AdminFeesPaymentsPage from '../pages/adminPages/FeesAndPayments/AdminFeesPaymentsPage';
import FeeCreationPage from '../pages/adminPages/FeesAndPayments/FeeCreationPage';
import FeeEditPage from '../pages/adminPages/FeesAndPayments/FeeEditPage';
import AdminRequestsPage from '../pages/adminPages/requests/AdminRequestsPage';
import AdminSubmittedRequestPage from '../pages/adminPages/requests/AdminSubmittedRequestPage';
import DesignRequestFormPage from '../pages/adminPages/requests/DesignRequestFormPage';
import CreateMarketPeriodPage from '../pages/adminPages/requests/CreateMarketPeriodPage';
import AdminSellerPartisipationsPage from '../pages/adminPages/sellers/AdminSellerPartisipationsPage';
import { requireAuth, rootRoute } from './baseRoutes';
import AdminUserDetailedPage from '../pages/adminPages/users/AdminUserDetailedPage';

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

export const participationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/participations',
  component: AdminSellerPartisipationsPage,
});

export const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/users',
  component: AdminUsersPage,
});

export const userCreateRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/users/new',
  component: () => createElement(AdminUserDetailedPage, { isCreation: true }),
});

export const userDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/users/$id',
  component: () => createElement(AdminUserDetailedPage, { isCreation: false }),
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

export const sellerMarketDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/sellers/$sellerId/market/$marketConnectionId',
  component: AdminSellerMarketPage,
});

export const sellerCreateRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/sellers/new',
  component: AdminSellerEditPage,
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

export const feeCreationRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/fees-payments/new',
  component: FeeCreationPage,
});

export const feeEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/fees-payments/$feeRuleId',
  component: FeeEditPage,
});

export const requestsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests',
  component: AdminRequestsPage,
});

export const submittedRequestDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests/$id',
  component: AdminSubmittedRequestPage,
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

export const createMarketPeriodRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests/periods/new',
  component: CreateMarketPeriodPage,
});

export const editMarketPeriodRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/requests/periods/$periodId',
  component: CreateMarketPeriodPage,
});

export const adminRouteTree = protectedRoute.addChildren([
  dashboardRoute,
  participationsRoute,
  usersRoute,
  userCreateRoute,
  userDetailRoute,
  feesPaymentsRoute,
  feeCreationRoute,
  feeEditRoute,
  sellersRoute,
  sellerCreateRoute,
  sellerDetailRoute,
  sellerMarketDetailRoute,
  marketsRoute,
  marketCreateRoute,
  marketDetailRoute,
  reportsRoute,
  requestsRoute,
  submittedRequestDetailRoute,
  designRequestFormRoute,
  designRequestFormEditRoute,
  createMarketPeriodRoute,
  editMarketPeriodRoute,
]);