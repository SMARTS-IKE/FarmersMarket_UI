export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  [key: string]: unknown;
}

export interface User {
  id?: string | number;
  name?: string;
  email?: string;
  [key: string]: unknown;
}
