import { Outlet } from '@tanstack/react-router';

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-6 text-left text-(--color-text-heading)">
      <Outlet />
    </div>
  );
}
