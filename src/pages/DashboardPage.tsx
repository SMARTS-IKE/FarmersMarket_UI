import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate({ to: '/login' });
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-4 bg-(--color-bg) text-(--color-text-heading)">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-(--color-text-muted)">
        Welcome{user?.name ? `, ${user.name}` : ''}!
      </p>
      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg bg-(--color-danger) text-(--color-danger-fg) font-semibold hover:bg-(--color-danger-hover) transition cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}
