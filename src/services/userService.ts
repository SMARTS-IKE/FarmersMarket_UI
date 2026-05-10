import { http } from '../lib/http';
import type { AppUser, AssignRoleRequest, UpdateUserRequest, UserListResult, UserSearchRequest } from '../models/user';

export async function getUsers(params: UserSearchRequest): Promise<UserListResult> {
  const query = new URLSearchParams();

  if (params.name) query.set('Name', params.name);
  if (params.email) query.set('Email', params.email);
  if (params.role) query.set('Role', params.role);
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  return http.get<UserListResult>(`/Users${qs ? `?${qs}` : ''}`);
}

export async function getUserById(id: string): Promise<AppUser> {
  return http.get<AppUser>(`/Users/${id}`);
}

export async function updateUser(id: string, payload: UpdateUserRequest): Promise<void> {
  await http.put<void, UpdateUserRequest>(`/Users/${id}`, payload);
}

export async function assignUserRole(id: string, payload: AssignRoleRequest): Promise<void> {
  await http.post<void, AssignRoleRequest>(`/Users/${id}/roles`, payload);
}

export async function removeUserRole(id: string, role: string): Promise<void> {
  await http.delete<void>(`/Users/${id}/roles/${encodeURIComponent(role)}`);
}

export async function reinitializeUserPassword(id: string): Promise<void> {
  await http.post<void, null>(`/Users/${id}/reset-password`, null);
}
