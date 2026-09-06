import { createRouter } from '@tanstack/react-router';
import React from 'react';
import { createHashHistory } from '@tanstack/history';
import { adminRouteTree } from './adminRoutes';
import { authRouteTree } from './authRoutes';
import { userRouteTree } from './userRoutes';
import { indexRoute, rootRoute } from './baseRoutes';

// Simple default Not Found component for routes (avoid JSX to keep .ts parsing safe)
function DefaultNotFound() {
  return React.createElement('div', null, 'Not Found');
}

const history = createHashHistory();

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRouteTree,
  adminRouteTree,
  userRouteTree,
]);

export const router = createRouter({ routeTree, history, defaultNotFoundComponent: DefaultNotFound });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

