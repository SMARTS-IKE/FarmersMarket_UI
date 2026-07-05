import { Outlet } from '@tanstack/react-router';
import SystemAdminLayout from './SystemAdminLayout';
import UserAccessLayout from './UserAccessLayout';
import { useAuthStore } from '../store/authStore';
import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';

function normalizeRole(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export default function RoleBasedLayout() {
  const { role } = useAuthStore();
  const currentRole = normalizeRole(role);

  if (currentRole === normalizeRole(USER_ROLE_MAPPING.ADMIN)) {
    return <SystemAdminLayout />;
  }

  if (currentRole === normalizeRole(USER_ROLE_MAPPING.USER)) {
    return <UserAccessLayout />;
  }

  // If role is unknown, default to admin layout to keep behaviour predictable
  return <SystemAdminLayout />;
}