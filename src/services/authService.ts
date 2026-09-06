import { USER_ROLE_MAPPING } from '../shared/mappings/users.mapping';
import { http } from '../lib/http';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../models/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return http.post<AuthResponse, LoginCredentials>('/auth/login', credentials, { public: true });
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return http.post<AuthResponse, RegisterCredentials>('/auth/register', credentials, { public: true });
}

export async function forgotPassword(payload: { email: string }): Promise<void> {
  return http.post<void, { email: string }>('/auth/forgot-password', payload, { public: true });
}

export async function requestRegistration(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Preserve an explicitly provided `role` (e.g. 'User_Access'),
  // otherwise default to the normalized role string 'User_Access'.
  const payload: RegisterCredentials & { role: string } = {
    ...credentials,
    role: credentials.role ?? 'User_Access',
  };
  return http.post<AuthResponse, RegisterCredentials & { role: string }>(
    '/auth/register',
    payload,
    { public: true }
  );
}

