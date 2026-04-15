import { http } from '../lib/http';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../models/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return http.post<AuthResponse, LoginCredentials>('/auth/login', credentials, { public: true });
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return http.post<AuthResponse, RegisterCredentials>('/auth/register', credentials, { public: true });
}

