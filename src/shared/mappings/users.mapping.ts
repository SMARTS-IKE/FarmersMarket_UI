import { UserRole, UserRoleLabels } from './GlobalEnums';

// Use the enum *names* (e.g. 'Admin_Access', 'User_Access') as the canonical
// role identifiers for values stored/returned by the backend. Use the
// UserRoleLabels for the displayed (Greek) titles.
export const USER_ROLE_MAPPING_TITLES: Record<string, string> = {
  [UserRole[UserRole.Admin_Access]]: UserRoleLabels[UserRole.Admin_Access],
  [UserRole[UserRole.User_Access]]: UserRoleLabels[UserRole.User_Access],
};

export const USER_ROLE_MAPPING = {
  ADMIN: UserRole[UserRole.Admin_Access],
  USER: UserRole[UserRole.User_Access],
};