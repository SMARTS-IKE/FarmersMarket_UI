import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import logo02 from '../assets/logo-02.svg';
import logo03 from '../assets/logo-03.svg';
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
  const { filterSlot, tabSlot } = useLayoutSlot();
  const connectedUserName = user?.name ?? email ?? 'Δεν υπάρχει διαθέσιμο email';

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh w-full flex-col overflow-visible border border-(--color-border) bg-(--color-surface) shadow-[var(--shadow-lg)] md:overflow-hidden">
        <header className="border-b-4 border-[#ef4123] bg-[#C4B5A0] px-4 md:px-6">
          <div className="grid grid-cols-[22%_56%_22%] items-stretch gap-2 py-2 xl:py-0">
            <div className="flex min-w-0 items-center justify-start pl-6">
              <img src={logo02} alt="Farmers Market logo" className="h-auto max-h-[70px] w-full max-w-[180px] rounded-lg object-contain xl:max-h-[88px]" />
            </div>

            <nav className="flex min-w-0 flex-wrap items-stretch justify-center gap-2" aria-label="System admin sections">
              {systemAdminTabs.map((tab) => {
                const isActive = activeTab.to === tab.to;

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex h-full min-w-[100px] max-w-[128px] flex-1 items-center justify-center rounded border px-0.5 py-0.5 text-center text-[10px] leading-tight font-medium whitespace-normal transition sm:min-w-[12px] sm:text-[14px] xl:flex-col-reverse ${
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

        <div className="grid flex-1 gap-px bg-(--color-border-subtle) lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className={`bg-(--color-bg-subtle) px-3 py-3 md:flex md:flex-col md:justify-between${isList ? ' lg:hidden' : ''}`}>
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-lg uppercase text-center font-bold text-(--color-text)">
                  ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                </p>
              </div>
              <span  className="mt-1 pb-2 text-3xl text-center md:mt-4 text-light border-b">
                {activeTab.title}
              </span>
            </div>
          </aside>

          <main className={`flex h-full min-h-0 flex-col bg-(--color-surface) p-5 md:p-7${isList ? ' lg:col-span-3' : ''}`}>
            {isList && (
              <div className="hidden lg:flex justify-between items-end mb-4 gap-4">
                {/* Left column content */}
                <div className="flex flex-col gap-2 md:gap-4">
                  <div>
                    <p className="text-lg max-w-[300px] uppercase text-center font-bold text-(--color-text)">
                      ΠΛΑΤΦΟΡΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΛΑΪΚΩΝ ΑΓΟΡΩΝ
                    </p>
                  </div>
                  <span  style={{color: '#ef4123'}} className="mt-1 text-3xl pb-2 border-b  text-center md:mt-4 text-[#5C4A3D]">
                    {activeTab.title}
                  </span>
                </div>
                {/* Filter slot */}
                {(tabSlot || filterSlot) && (
                  <div className="flex flex-1 min-w-0 flex-col items-stretch justify-end gap-2 overflow-x-auto">
                    {tabSlot && (
                      <div className="w-full">{tabSlot}</div>
                    )}
                    {filterSlot && (
                      <div className="flex min-w-0 items-end justify-center overflow-x-auto">{filterSlot}</div>
                    )}
                  </div>
                )}
                {/* Right column content */}
                <div className="flex self-stretch flex-col items-center justify-start">
                  <ConnectedUserCard connectedUserName={connectedUserName} className="max-w-fit" />
                  {!isList && (
                    <img src={logo03} alt="Farmers Market emblem" className="mt-4 h-auto w-full max-w-full object-contain" />
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-1 min-h-0 flex-col">
              <Outlet />
            </div>
          </main>

          <aside className={`bg-(--color-bg-subtle) px-4 py-3 md:p-6${isList ? ' lg:hidden' : ''}`}>
            <div className="flex h-full w-full flex-col items-center">
              <ConnectedUserCard connectedUserName={connectedUserName} className="max-w-fit" />
              {!isList && (
                <img src={logo03} alt="Farmers Market emblem" className="mt-auto h-auto w-full max-w-full object-contain" />
              )}
            </div> 
          </aside>
        </div>
      </div>
    </div>
  );
}