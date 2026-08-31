export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  afm?: string;
  phone?: string;
  address?: string;
  sellerType?: number;
  password?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  email?: string;
  roles?: string[];
  user?: User;
  role?: string;
  [key: string]: unknown;
}

export interface User {
  id?: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  roles?: string[];
  status?: string;
  aspNetUserId?: string;
  userId?: string;
  sellerId?: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  sub: string;
  userId: string;
  email: string;
  status: string;
  firstName: string;
  lastName: string;
  role: string | string[];
  exp: number;
  iss: string;
  aud: string;
  [key: string]: unknown;
}
