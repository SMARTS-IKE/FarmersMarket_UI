import { UserRole } from './GlobalEnums';

export const USER_ROLE_MAPPING_TITLES: Record<string, string> = {
  [UserRole[UserRole.Admin_Access]]: 'Διαχειριστής',
  [UserRole[UserRole.User_Access]]: 'Χρήστης',
};

export const USER_ROLE_MAPPING = {
  ADMIN: UserRole[UserRole.Admin_Access],
  USER: UserRole[UserRole.User_Access],
};