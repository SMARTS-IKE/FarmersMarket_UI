import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import logo02 from '../assets/logo-02.svg';
import { useAuthStore } from '../store/authStore';

interface DefaultProtectedLayoutProps {
  children?: ReactNode;
}

export default function DefaultProtectedLayout({ children }: DefaultProtectedLayoutProps) {
  const { user, email, role, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const displayName = user?.name?.trim() || user?.email || email || 'Connected user';
  const displayRole = user?.role || user?.roles?.[0] || role || 'User';

  function handleLogout() {
    clearAuth();
    navigate({ to: '/auth/login' });
  }
  return (
    <div className="min-h-svh bg-(--color-bg) px-4 py-6 md:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl gap-6 rounded-[28px] border border-(--color-border) bg-(--color-surface) p-6 shadow-[var(--shadow-lg)] md:p-8">
        <aside className={`flex flex-col gap-4 bg-(--color-bg-subtle) p-3 transition-all ${collapsed ? 'w-20' : 'w-72'}`}>
          <div className="flex items-center justify-end">
            <IconButton aria-label="toggle_menu" onClick={() => setCollapsed((s) => !s)} size="small">
              {collapsed ? <MenuRoundedIcon /> : <CloseRoundedIcon />}
            </IconButton>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between gap-4 rounded-2xl bg-(--color-bg-header-footer) px-6 py-4 mb-2">
            <div className="flex items-center gap-4">
              <img src={logo02} alt="Farmers Market logo" className="h-auto max-h-[64px] w-auto rounded-lg object-contain" />
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                <p className="text-base font-bold uppercase text-(--color-text) whitespace-nowrap">Πλατφόρμα Διαχείρισης</p>
                <p className="text-sm uppercase text-(--color-text)">Λαϊκών Αγορών</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Tooltip title="Account">
                <IconButton aria-label="account_circle" onClick={() => null} sx={{ width: 32, height: 32, color: '#3D2817' }}>
                  <UserCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton aria-label="logout" onClick={handleLogout} sx={{ width: 32, height: 32, color: '#3D2817' }}>
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </header>

          <main className="flex-1 rounded-[24px] border border-(--color-border-subtle) bg-(--color-bg) p-5 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}