import { createRoute, redirect } from '@tanstack/react-router';
import RoleBasedLayout from '../layouts/RoleBasedLayout';
import UserDashboardPage from '../pages/userPages/UserDashboardPage';
import AdminMarketDetailPage from '../pages/adminPages/markets/AdminMarketDetailPage';
import UserRequestsPage from '../pages/userPages/UserRequestsPage';
import UserRequestCreationDetailsPage from '../pages/userPages/UserRequestCreationDetailsPage';
import UserRequestCreationPage from '../pages/userPages/UserRequestCreationPage';
import UserMarketsPage from '../pages/userPages/UserMarketsPage';
import SubmittedRequestDetailedPage from '../pages/adminPages/requests/SubmittedRequestDetailedPage';
import { requireAuth, requireUserRole, rootRoute } from './baseRoutes';
import { useAuthStore } from '../store/authStore';
import { getSellers } from '../services/sellerService';
import { getSellerRequests } from '../services/requestService';

export const userProtectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'user-protected',
  beforeLoad: requireAuth,
  component: RoleBasedLayout,
});

export const userDashboardRoute = createRoute({
  getParentRoute: () => userProtectedRoute,
  path: '/users',
  component: UserDashboardPage,
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
  beforeLoad: async () => {
    requireAuth();
   

    const currentUser = useAuthStore.getState().user;
  
    if (!currentUser) return;

    try {
      const sellersResp = await getSellers({ name: '', afm: '', sellerType: '', page: 1, pageSize: 1000 });
      const allSellers = sellersResp?.items ?? [];

      const matchByUserId = allSellers.find((s: any) => s.userId != null && String(s.userId) === String(currentUser.id));
      const matchByAfm = allSellers.find((s: any) => s.afm && (currentUser as any)?.afm && String(s.afm) === String((currentUser as any).afm));
      const authName = ((currentUser as any)?.name ?? `${(currentUser as any)?.firstName ?? ''} ${(currentUser as any)?.lastName ?? ''}`).trim();
      const matchByName = allSellers.find((s: any) => {
        const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
        return sName && authName && sName === authName;
      });

      const matchedSeller = matchByUserId || matchByAfm || matchByName || null;
      const sellerIdNum = matchedSeller ? Number((matchedSeller as any).id) : undefined;
      if (!sellerIdNum) return;

      const requests = await getSellerRequests({ sellerId: sellerIdNum } as any);
      if (Array.isArray(requests) && requests.length > 0) {
        // Find the most recently submitted request
        const sorted = requests.slice().sort((a: any, b: any) => {
          const da = new Date(a.submittedAt ?? '').getTime() || 0;
          const db = new Date(b.submittedAt ?? '').getTime() || 0;
          return db - da;
        });
        const latest = sorted[0];
        if (latest && latest.id) {
          throw redirect({ to: `/users/requests/${latest.id}` });
        }
      }
    } catch (err) {
      // If any error occurs, fallback to showing the list page.
      return;
    }
  },
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
    path: '/users/requests/{$id}',
    component: SubmittedRequestDetailedPage,
  }),
]);
