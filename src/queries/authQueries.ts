import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { AuthResponse, RegisterCredentials } from '../models/auth';
import { requestRegistration as register } from '../services/authService';
import { userKeys } from './userQueries';

export function useRegisterMutation() {
  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: register,
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: userKeys.all });
      } catch (e) {
        // ignore
      }
    },
  });
}