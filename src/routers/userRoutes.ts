import { createRoute } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import AdminDashboardPage from '../pages/adminPages/AdminDashboardPage';
import AdminMarketDetailPage from '../pages/adminPages/markets/AdminMarketDetailPage';
import UserRequestsPage from '../pages/userPages/UserRequestsPage';
import UserRequestCreationDetailsPage from '../pages/userPages/UserRequestCreationDetailsPage';
import UserRequestCreationPage from '../pages/userPages/UserRequestCreationPage';
import UserMarketsPage from '../pages/userPages/UserMarketsPage';
import SubmittedRequestDetailedPage from '../pages/adminPages/requests/SubmittedRequestDetailedPage';
import { requireAuth, requireUserRole, rootRoute } from './baseRoutes';

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
  component: UserMarketsPage,
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

export const userRequestCreationRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/requests/new',
  beforeLoad: requireUserRole,
  component: UserRequestCreationPage,
});

export const userFormCreationDetailsRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users/requests/forms/$formId',
  component: UserRequestCreationDetailsPage,
});

export const userRouteTree = userProtectedRoute.addChildren([
  userDashboardRoute,
  userMarketsRoute,
  userMarketDetailRoute,
  userRequestsRoute,
  userRequestCreationRoute,
  userFormCreationDetailsRoute,
  createRoute({
    getParentRoute: () => userProtectedRoute,
    path: '/users/requests/$id',
    component: SubmittedRequestDetailedPage,
  }),
]);
