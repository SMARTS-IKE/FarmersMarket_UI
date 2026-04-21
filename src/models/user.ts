export interface UserSearchRequest {
  name: string;
  email: string;
  role: string;
  page: number;
  pageSize: number;
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createAt: string;
}

export interface UserListResponse {
  items: AppUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type UserListResult = AppUser[] | UserListResponse;

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface AssignRoleRequest {
  role: string;
}
