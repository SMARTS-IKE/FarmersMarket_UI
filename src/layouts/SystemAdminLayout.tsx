import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import logo02 from '../assets/logo-02.svg';
import { getSystemAdminTab, systemAdminTabs } from '../lib/systemAdminTabs';
import { useAuthStore } from '../store/authStore';
import { LayoutSlotProvider, useLayoutSlot } from '../lib/layoutSlotContext';

function ConnectedUserCard({
  connectedUserName,
  className = '',
}: {
  connectedUserName: string;
  className?: string;
}) {
  return (
    <div className={`flex w-full flex-col overflow-hidden rounded-2xl border-2 border-[#7B6654] bg-[#FFFDF8] text-center shadow-[var(--shadow)] ${className}`}>
      <div className="border-b border-[#C9B9A9] px-4 py-2 text-sm font-medium text-[#5C4A3D]">
        Συνδεδεμένος Χρήστης
      </div>
      <div className="flex items-center justify-center bg-[#A69486] px-4 py-2 text-center text-[#FFF9F4]">
        <div className="truncate text-center text-sm font-semibold">
          {connectedUserName}
        </div>
      </div>
    </div>
  );
}

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
  const isList = !!activeTab.hasList && location.pathname === activeTab.to;
  const { filterSlot } = useLayoutSlot();
  const connectedUserName = user?.name ?? email ?? 'Δεν υπάρχει διαθέσιμο email';

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="min-h-[85px] border-b-2 border-(--color-secondary) bg-[#C4B5A0] px-4 md:px-6">
          <div className="relative flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 w-[310px] flex justify-center">
              <img src={logo02} alt="Farmers Market logo" className="h-[80px] w-[150px] rounded-lg object-cover" />
            </div>

            {/* Navigation */}
            <nav className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center" aria-label="System admin sections">
              {systemAdminTabs.map((tab) => {
                const isActive = activeTab.to === tab.to;

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`w-[80px] xl:w-[200px] h-[88px] px-[10px] sm:px-[20px] md:px-[30px] lg:px-[50px] text-center text-xs sm:text-sm font-medium transition whitespace-normal flex flex-col-reverse items-center justify-center rounded border ${
                      isActive
                        ? 'border-[#A69680] bg-(--color-text-muted) text-(--color-surface)'
                        : 'border-0 text-[#5C4A3D] hover:text-[#3D2817] hover:bg-[#E8DCC8]'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0">
              <Tooltip title="Logout">
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

        <div className="grid flex-1 gap-px bg-(--color-border-subtle) lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className={`bg-(--color-bg-subtle) px-3 py-3 md:flex md:flex-col md:justify-between${isList ? ' lg:hidden' : ''}`}>
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-xs uppercase text-center font-bold text-(--color-text)">
                 ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                </p>
              </div>
              <span className="mt-1 pb-2 text-2xl text-subtle text-center md:mt-4">
                {activeTab.title}
              </span>
            </div>
          </aside>

          <main className={`bg-(--color-surface) p-5 md:p-7${isList ? ' lg:col-span-3' : ''}`}>
            {isList && (
              <div className="hidden lg:flex justify-between items-end mb-4 gap-4">
                {/* Left column content */}
                <div className="flex flex-col gap-2 md:gap-4">
                  <div>
                    <p className="text-lg max-w-[300px] uppercase text-center font-bold text-(--color-text)">
                      ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                    </p>
                  </div>
                  <span className="mt-1 text-4xl pb-2 text-subtle text-center md:mt-4">
                    {activeTab.title}
                  </span>
                </div>
                {/* Filter slot */}
                {filterSlot && (
                  <div className="flex flex-1 min-w-0 items-end justify-center overflow-x-auto">
                    {filterSlot}
                  </div>
                )}
                {/* Right column content */}
                <ConnectedUserCard connectedUserName={connectedUserName} className="max-w-[280px]" />
              </div>
            )}
              <Outlet />
          </main>

          <aside className={`bg-(--color-bg-subtle) px-4 py-3 md:p-6${isList ? ' lg:hidden' : ''}`}>
            <ConnectedUserCard connectedUserName={connectedUserName} className="md:max-w-[280px]" />
          </aside>
        </div>
      </div>
    </div>
  );
}