import { http } from '../lib/http';
import type { UserSearchRequest, UserListResponse } from '../models/user';

export async function getUsers(params: UserSearchRequest): Promise<UserListResponse> {
  const query = new URLSearchParams();

  if (params.name) query.set('Name', params.name);
  if (params.email) query.set('Email', params.email);
  if (params.role) query.set('Role', params.role);
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  return http.get<UserListResponse>(`/Users${qs ? `?${qs}` : ''}`);
}
