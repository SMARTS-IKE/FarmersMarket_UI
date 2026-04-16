import { Outlet } from '@tanstack/react-router';
import DefaultProtectedLayout from './DefaultProtectedLayout';
import SystemAdminLayout from './SystemAdminLayout';
import { useAuthStore } from '../store/authStore';

function normalizeRole(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export default function RoleBasedLayout() {
  const { user, role } = useAuthStore();
  const currentRole = normalizeRole(user?.role || user?.roles?.[0] || role);

  if (currentRole === 'systemadmin' || currentRole === 'admin') {
    return <SystemAdminLayout />;
  }

  return (
    <DefaultProtectedLayout>
      <Outlet />
    </DefaultProtectedLayout>
  );
}