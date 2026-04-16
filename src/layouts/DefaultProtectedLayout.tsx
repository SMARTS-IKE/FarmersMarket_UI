import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface DefaultProtectedLayoutProps {
  children?: ReactNode;
}

export default function DefaultProtectedLayout({ children }: DefaultProtectedLayoutProps) {
  const { user, email, role } = useAuthStore();
  const displayName = user?.name?.trim() || user?.email || email || 'Connected user';
  const displayRole = user?.role || user?.roles?.[0] || role || 'User';

  return (
    <div className="min-h-svh bg-(--color-bg) px-4 py-6 md:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl flex-col gap-6 rounded-[28px] border border-(--color-border) bg-(--color-surface) p-6 shadow-[var(--shadow-lg)] md:p-8">
        <header className="flex items-center justify-between gap-4 border-b border-(--color-border-subtle) pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-text-muted)">
              Farmers Market
            </p>
            <h1 className="mt-2 mb-0 text-3xl">Workspace</h1>
          </div>
          <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-subtle) px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">Connected user</p>
            <p className="mt-1 text-base font-semibold text-(--color-text-heading)">{displayName}</p>
            <p className="mt-1 text-sm text-(--color-text-muted)">{displayRole}</p>
          </div>
        </header>

        <main className="flex-1 rounded-[24px] border border-(--color-border-subtle) bg-(--color-bg) p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}