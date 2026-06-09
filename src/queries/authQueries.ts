import { useMutation } from '@tanstack/react-query';
import type { AuthResponse, RegisterCredentials } from '../models/auth';
import { requestRegistration as register } from '../services/authService';

export function useRegisterMutation() {
  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: register,
  });
}