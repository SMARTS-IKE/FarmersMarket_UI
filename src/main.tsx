import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import './index.css';
import { queryClient } from './lib/queryClient';
import GlobalEnumsProvider from './shared/components/GlobalEnums';

const root = createRoot(document.getElementById('root')!);

async function renderApp() {
  const { router } = await import('./routers/router');

  root.render(
    <StrictMode>
      <GlobalEnumsProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </GlobalEnumsProvider>
    </StrictMode>,
  );
}

renderApp();

if (import.meta.hot) {
  import.meta.hot.accept('./routers/router', (module) => {
    // When the router module updates, re-import and re-render with the fresh router
    renderApp();
  });
  import.meta.hot.accept(() => {
    renderApp();
  });
}
