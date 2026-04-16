import { Outlet } from '@tanstack/react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-lg p-12">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-(--color-text-heading) mb-1">
            Farmers Market
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
