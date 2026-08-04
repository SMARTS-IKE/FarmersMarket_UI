import { UserRole, UserRoleLabels } from './GlobalEnums';

export const USER_ROLE_MAPPING_TITLES: Record<string, string> = {
  [UserRoleLabels[UserRole.Admin_Access]]: 'Διαχειριστής',
  [UserRoleLabels[UserRole.User_Access]]: 'Χρήστης',
};

export const USER_ROLE_MAPPING = {
  ADMIN: UserRoleLabels[UserRole.Admin_Access],
  USER: UserRoleLabels[UserRole.User_Access],
};