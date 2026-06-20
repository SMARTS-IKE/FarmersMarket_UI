import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import logo02 from '../assets/logo-02.svg';
import logo03 from '../assets/logo-03.svg';
import { getSystemAdminTab, systemAdminTabs } from '../lib/systemAdminTabs';
import { useAuthStore } from '../store/authStore';
import { LayoutSlotProvider, useLayoutSlot } from '../lib/layoutSlotContext';

// Connected user card removed; sidebar contains navigation and branding

export default function SystemAdminLayout() {
  return (
    <LayoutSlotProvider>
      <SystemAdminLayoutInner />
    </LayoutSlotProvider>
  );
}

function SystemAdminLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, email, clearAuth } = useAuthStore();
  const activeTab = getSystemAdminTab(location.pathname);
  const { filterSlot, tabSlot } = useLayoutSlot();
  const connectedUserName = user?.name ?? email ?? 'Δεν υπάρχει διαθέσιμο email';
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="border-b-4 border-[#ef4123] bg-[#C4B5A0] px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 py-2 xl:py-0">
            <div className="flex items-center gap-4">
              <img src={logo02} alt="Farmers Market logo" className="h-auto max-h-[70px] w-auto rounded-lg object-contain xl:max-h-[88px]" />
              <div className="hidden md:flex md:flex-col md:items-start md:leading-tight">
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
          <aside className={`flex flex-col gap-4 bg-(--color-bg-subtle) p-3 transition-all ${collapsed ? 'w-20' : 'w-72'}`}>
            <div className="flex items-center justify-end">
              <IconButton aria-label="toggle_menu" onClick={() => setCollapsed((s) => !s)} size="small">
                {collapsed ? <MenuRoundedIcon /> : <CloseRoundedIcon />}
              </IconButton>
            </div>

            <div className="mt-2 flex flex-1 flex-col gap-1">
              {systemAdminTabs.map((tab) => {
                const isActive = activeTab.to === tab.to;

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition ${isActive ? 'bg-(--color-text-muted) text-(--color-surface) border border-(--color-border)' : 'text-(--color-text) hover:bg-(--color-primary-subtle)'}`}
                  >
                    <span className="truncate">{!collapsed ? tab.label : tab.label.charAt(0)}</span>
                  </Link>
                );
              })}
            </div>

            {!collapsed && (
              <div className="mt-auto">
                <img src={logo03} alt="Farmers Market emblem" className="h-auto w-full object-contain" />
              </div>
            )}
          </aside>

          <main className={`flex-1 min-w-0 flex h-full min-h-0 flex-col bg-(--color-surface) p-5 md:p-7 transition-all`}>
            {(tabSlot || filterSlot) && (
              <div className="mb-4 flex min-w-0 flex-col items-stretch justify-start gap-2 overflow-x-auto">
                {tabSlot && (
                  <div className="w-full">{tabSlot}</div>
                )}
                {filterSlot && (
                  <div className="flex min-w-0 items-end justify-center overflow-x-auto">{filterSlot}</div>
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