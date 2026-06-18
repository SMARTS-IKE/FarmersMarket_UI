import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
  const navigate = useNavigate();
  const { user, email, clearAuth } = useAuthStore();
  const activeTab = getUserTab(location.pathname);
  const { filterSlot, tabSlot } = useLayoutSlot();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="border-b border-(--color-text-muted) bg-(--color-bg-header-footer)/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo02} alt="Farmers Market logo" className="h-auto max-h-[64px] w-auto rounded-lg object-contain" />
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                <p className="text-base font-bold text-(--color-text) whitespace-nowrap">Πλατφόρμα Διαχείρισης</p>
                <p className="text-base font-bold text-(--color-text) whitespace-nowrap">Λαϊκών Αγορών</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton aria-label="open_menu" onClick={() => setMobileOpen(true)} size="small" className="lg:hidden">
                <MenuRoundedIcon />
              </IconButton>
              <Tooltip title="Account">
                <IconButton aria-label="account" onClick={() => null} sx={{ width: 32, height: 32, color: 'var(--color-dark)' }}>
                  <UserCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton
                  aria-label="logout"
                  onClick={handleLogout}
                  sx={{
                    width: { xs: '100%', sm: 30 },
                    height: 30,
                    color: 'var(--color-dark)',
                    '&:hover': {
                      border: '1px solid var(--color-danger-hover)',
                    },
                  }}
                >
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-px bg-(--color-border-subtle) lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className={`hidden lg:flex flex-col gap-4 bg-(--color-bg-subtle) p-3 transition-all ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-(--color-text)">ΠΛΑΤΦΟΡΜΑ</p>
                {!collapsed && <p className="text-sm">Διαχείρισης Λαϊκών Αγορών</p>}
              </div>
              <IconButton aria-label="toggle_menu" onClick={() => setCollapsed((s) => !s)} size="small">
                {collapsed ? <MenuRoundedIcon /> : <CloseRoundedIcon />}
              </IconButton>
            </div>

            <div className="mt-2 flex flex-1 flex-col gap-1">
              {userTabs.map((tab) => {
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
                <div className="text-xs font-semibold text-(--color-text)">{activeTab.title}</div>
              </div>
            )}
          </aside>

          <main className={`bg-(--color-surface) p-5 md:p-7`}>
            {(tabSlot || filterSlot) && (
              <div className="mb-4 flex min-w-0 flex-col items-stretch justify-start gap-2 overflow-x-auto">
                {tabSlot && <div className="flex w-full justify-start">{tabSlot}</div>}
                {filterSlot && (
                  <div className="flex min-w-0 items-end justify-center overflow-x-auto">{filterSlot}</div>
                )}
              </div>
            )}
            <Outlet />
          </main>
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="relative z-50 flex w-72 flex-col gap-4 bg-(--color-bg-subtle) p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-(--color-text)">ΠΛΑΤΦΟΡΜΑ</p>
                  <p className="text-sm">Διαχείρισης Λαϊκών Αγορών</p>
                </div>
                <IconButton aria-label="close_menu" onClick={() => setMobileOpen(false)} size="small">
                  <CloseRoundedIcon />
                </IconButton>
              </div>

              <div className="mt-2 flex flex-1 flex-col gap-1">
                {userTabs.map((tab) => {
                  const isActive = activeTab.to === tab.to;

                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition ${isActive ? 'bg-(--color-text-muted) text-(--color-surface) border border-(--color-border)' : 'text-(--color-text) hover:bg-(--color-primary-subtle)'}`}
                    >
                      <span className="truncate">{tab.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto">
                <div className="text-xs font-semibold text-(--color-text)">{activeTab.title}</div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}