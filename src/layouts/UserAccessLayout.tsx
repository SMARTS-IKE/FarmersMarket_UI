import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
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
  const isList = !!activeTab.hasList && location.pathname === activeTab.to;
  const { filterSlot, tabSlot } = useLayoutSlot();

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="border-b border-(--color-text-muted) bg-(--color-bg-header-footer)/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center lg:flex-1" aria-label="User access sections">
              {userTabs.map((tab) => {
                const isActive = activeTab.to === tab.to;

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex min-h-8 min-w-40 items-center justify-center rounded-lg border py-1 text-center text-sm font-semibold transition ${
                      isActive
                        ? 'border-(--color-primary-border) bg-(--color-dark) text-(--color-primary-fg) shadow-[var(--shadow-sm)]'
                        : 'border-(--color-border) bg-(--color-bg) text-(--color-text-heading) hover:border-(--color-primary-border) hover:bg-(--color-primary-subtle)'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex justify-end lg:justify-start">
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

        <div className="grid flex-1 gap-px bg-(--color-border-subtle) lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className={`bg-(--color-bg-subtle) px-3 py-3 md:flex md:flex-col md:justify-between${isList ? ' lg:hidden' : ''}`}>
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-xs text-center font-bold uppercase text-(--color-text)">
                  ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                </p>
              </div>
              <span className={`mt-1 pb-2 text-center text-2xl md:mt-4`}>
                {activeTab.title}
              </span>
            </div>
          </aside>

          <main className={`bg-(--color-surface) p-5 md:p-7${isList ? ' lg:col-span-3' : ''}`}>
            {isList && (
              <div className="mb-4 hidden items-start justify-between gap-4 lg:flex">
                <div className="flex flex-col gap-2 md:gap-4">
                  <div>
                    <p className="text-xs text-center font-bold uppercase text-(--color-text)">
                      ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                    </p>
                  </div>
                  <span className="mt-1 pb-2 text-center text-2xl text-subtle md:mt-4">
                    {activeTab.title}
                  </span>
                </div>
                {(tabSlot || filterSlot) && (
                  <div className="flex min-w-0 flex-1 flex-col items-stretch justify-start gap-2 overflow-x-auto">
                    {tabSlot && <div className="flex w-full justify-start">{tabSlot}</div>}
                    {filterSlot && (
                      <div className="flex min-w-0 items-end justify-center overflow-x-auto">{filterSlot}</div>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2 rounded-[10px] border border-(--color-dark) bg-(--color-surface) px-4 py-3 text-center font-bold shadow-[var(--shadow)] md:gap-4 md:p-5">
                  <div className="text-xs text-(--color-dark)">
                    ΣΥΝΔΕΔΕΜΕΝΟΣ ΧΡΗΣΤΗΣ
                  </div>
                  <div className="bg-(--color-dark) py-1 text-sm text-(--color-light)">{user?.email || email || 'Δεν υπάρχει διαθέσιμο email'}</div>
                </div>
              </div>
            )}
            <Outlet />
          </main>

          <aside className={`bg-(--color-bg-subtle) px-4 py-3 md:p-6${isList ? ' lg:hidden' : ''}`}>
            <div className="flex flex-col gap-2 rounded-[10px] border border-(--color-border) bg-(--color-surface) px-4 py-3 text-center font-bold shadow-[var(--shadow)] md:gap-4 md:p-5">
              <div className="text-xs text-(--color-text-muted)">
                ΣΥΝΔΕΔΕΜΕΝΟΣ ΧΡΗΣΤΗΣ
              </div>
              <div className="bg-(--color-bg-subtle) py-1 text-sm text-(--color-text-muted)">{user?.email || email || 'Δεν υπάρχει διαθέσιμο email'}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}