import { createRouter } from '@tanstack/react-router';
import { adminRouteTree } from './adminRoutes';
import { authRouteTree } from './authRoutes';
import { userRouteTree } from './userRoutes';
import { indexRoute, rootRoute } from './baseRoutes';

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRouteTree,
  adminRouteTree,
  userRouteTree,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

