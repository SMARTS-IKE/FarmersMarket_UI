import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { router } from '../routers/router';
import Header from '../shared/components/Header';
import Sidebar from '../shared/components/Sidebar';
import { useState } from 'react';
import logo02 from '../assets/logo-02.svg';

import { getUserTab, userTabs } from '../lib/userTabs';
import { useAuthStore } from '../store/authStore';
import { LayoutSlotProvider, useLayoutSlot } from '../lib/layoutSlotContext';

export default function UserAccessLayout() {
  return (
    <LayoutSlotProvider>
      <UserAccessLayoutInner />
    </LayoutSlotProvider>
  );
}

function UserAccessLayoutInner() {
  const location = useLocation();
  const { user, email, clearAuth } = useAuthStore();
  const activeTab = getUserTab(location.pathname);
  const { filterSlot, tabSlot } = useLayoutSlot();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    clearAuth();
    void router.navigate({ to: '/auth/login' });
  }

  const navigate = useNavigate();

  function handleAccountClick() {
    const userId = user?.id ? String(user.id) : '';
    if (!userId) return;
    navigate({ to: '/admin/users/$id', params: { id: userId } });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-hidden border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <Header onLogout={handleLogout} onAccountClick={handleAccountClick} />

        <div className="flex flex-1 items-stretch gap-px bg-(--color-border-subtle)">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeTab={activeTab} tabs={userTabs} />

          <main className={`flex-1 min-w-0 flex h-full min-h-0 flex-col bg-(--color-surface) p-5 md:p-7 transition-all`}>
            {(tabSlot || filterSlot) && (
              <div className="mb-4 flex min-w-0 flex-col items-stretch justify-start gap-2 overflow-x-auto">
                {tabSlot && (
                  <div className="w-full">{tabSlot}</div>
                )}
                {filterSlot && (
                  <div className="flex min-w-0 items-start justify-center overflow-x-auto py-3 min-h-[56px]">{filterSlot}</div>
                )}
              </div>
            )}

            <div
              className="flex flex-1 min-h-0 flex-col overflow-y-auto"
              style={{ height: 'calc(100vh - 160px)' }}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}