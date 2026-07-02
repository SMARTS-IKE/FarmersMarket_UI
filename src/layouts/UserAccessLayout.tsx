import { Outlet, useLocation } from '@tanstack/react-router';
import { router } from '../routers/router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
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

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="relative z-20 border-b-4 border-[#ef4123] bg-[#C4B5A0] px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 py-2 xl:py-0">
            <div className="flex items-center gap-4">
              <img src={logo02} alt="Farmers Market logo" className="h-auto max-h-[70px] w-auto rounded-lg object-contain xl:max-h-[88px]" />
              <div className="flex flex-col items-start leading-tight">
                <p className="text-base font-bold text-(--color-text) whitespace-nowrap">Πλατφόρμα Διαχείρισης</p>
                <p className="text-sm text-(--color-text)">Λαϊκών Αγορών</p>
              </div>
            </div>

            <div className="flex items-center justify-end pr-6">
              <Tooltip title="Διαχείριση λογαριασμού">
                <IconButton
                  aria-label="account_circle"
                  onClick={() => null}
                  sx={{
                    width: 32,
                    height: 32,
                    color: '#3D2817',
                    '&:hover': {
                      backgroundColor: 'rgba(61, 40, 23, 0.1)',
                    },
                  }}
                >
                  <UserCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Αποσύνδεση">
                <IconButton
                  aria-label="logout"
                  onClick={handleLogout}
                  sx={{
                    width: 32,
                    height: 32,
                    color: '#3D2817',
                    '&:hover': {
                      backgroundColor: 'rgba(61, 40, 23, 0.1)',
                    },
                  }}
                >
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </header>

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

            <div className="flex flex-1 min-h-0 flex-col">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}