import { Outlet } from '@tanstack/react-router';
import DefaultProtectedLayout from './DefaultProtectedLayout';
import SystemAdminLayout from './SystemAdminLayout';
import { useAuthStore } from '../store/authStore';
import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';

function normalizeRole(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export default function RoleBasedLayout() {
  const { user, role } = useAuthStore();
  const currentRole = normalizeRole(user?.roles?.[0]);

  if (currentRole === USER_ROLE_MAPPING.ADMIN.toLowerCase()) {
    return <SystemAdminLayout />;
  }

  return (
    <DefaultProtectedLayout>
      <Outlet />
    </DefaultProtectedLayout>
  );
}