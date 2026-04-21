import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { AppUser, AssignRoleRequest, UpdateUserRequest, UserListResult, UserSearchRequest } from '../models/user';
import { assignUserRole, getUserById, getUsers, removeUserRole, updateUser } from '../services/userService';

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserSearchRequest) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsersQuery(params: UserSearchRequest) {
  return useQuery<UserListResult, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

export function useUserQuery(id: string) {
  return useQuery<AppUser, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateUserMutation(id: string) {
  return useMutation<void, Error, UpdateUserRequest>({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
      ]);
    },
  });
}

export function useAssignUserRoleMutation(id: string) {
  return useMutation<void, Error, AssignRoleRequest>({
    mutationFn: (payload) => assignUserRole(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
      ]);
    },
  });
}

export function useRemoveUserRoleMutation(id: string) {
  return useMutation<void, Error, string>({
    mutationFn: (role) => removeUserRole(id, role),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
      ]);
    },
  });
}
