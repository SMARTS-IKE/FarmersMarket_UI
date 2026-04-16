import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { getSystemAdminTab, systemAdminTabs } from '../lib/systemAdminTabs';
import { useAuthStore } from '../store/authStore';

export default function SystemAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, email, clearAuth } = useAuthStore();
  const activeTab = getSystemAdminTab(location.pathname);

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:min-h-[calc(100svh-3rem)] md:overflow-hidden">
        <header className="border-b border-(--color-border-subtle) bg-(--color-surface)/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <nav className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center lg:flex-1" aria-label="System admin sections">
              {systemAdminTabs.map((tab) => {
                const isActive = activeTab.to === tab.to;

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? 'border-(--color-primary-border) bg-(--color-primary) text-(--color-primary-fg) shadow-[var(--shadow-sm)]'
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

        <div className="grid flex-1 gap-px bg-(--color-border-subtle) lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="bg-(--color-bg-subtle) px-4 py-3 md:flex md:flex-col md:justify-between md:p-6">
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-xs uppercase text-(--color-text-muted)">
                 Πλατφόρμα Διαχείρισης Λαικών Αγορών
                </p>
              </div>
              <h2 className="mt-1 text-xl leading-tight md:mt-4 md:text-[30px]">{activeTab.title}</h2>
            </div>
          </aside>

          <main className="bg-(--color-surface) p-5 md:p-7">
              <Outlet />
          </main>

          <aside className="bg-(--color-bg-subtle) px-4 py-3 md:p-6">
            <div className="flex flex-col gap-2 rounded-[10px] border border-(--color-border) bg-(--color-surface) px-4 py-3 text-center font-bold shadow-[var(--shadow)] md:gap-4 md:p-5">
              <div className="text-xs  text-(--color-text-muted)">
                ΣΥΝΔΕΔΕΜΕΝΟΣ ΧΡΗΣΤΗΣ
              </div>
              <div className="text-sm py-1 bg-(--color-bg-subtle) text-(--color-text-muted)">{user?.email || email || 'Δεν υπάρχει διαθέσιμο email'}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}