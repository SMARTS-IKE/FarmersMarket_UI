import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import './index.css';
import { queryClient } from './lib/queryClient';
import { router } from './routers/router';
import GlobalEnumsProvider from './shared/components/GlobalEnums';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalEnumsProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </GlobalEnumsProvider>
  </StrictMode>,
);
