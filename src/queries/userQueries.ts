import { useQuery } from '@tanstack/react-query';
import type { UserSearchRequest, UserListResponse } from '../models/user';
import { getUsers } from '../services/userService';

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserSearchRequest) => ['users', 'list', params] as const,
};

export function useUsersQuery(params: UserSearchRequest) {
  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}
