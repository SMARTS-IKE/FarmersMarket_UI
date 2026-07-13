import { useAuthStore } from '../store/authStore';
import { useLoadingStore } from '../store/loadingStore';
import { router } from '../routers/router';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  /** Skip attaching the Authorization header (e.g. login, register) */
  public?: boolean;
}

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body: ApiError | null = null,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function parseError(response: Response): Promise<HttpError> {
  const body = await response.json().catch(() => null) as ApiError | null;
  const message = body?.message ?? `HTTP ${response.status} ${response.statusText}`;
  return new HttpError(response.status, message, body);
}

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, public: isPublic = false } = options;
  const { block, unblock } = useLoadingStore.getState();

  // ── Attach Authorization header ──────────────────────────────
  if (!isPublic) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isUrlSearchParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;

  if (body !== undefined && !isFormData && !isUrlSearchParams) {
    headers['Content-Type'] = 'application/json';
  }

  block();
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? (isFormData || isUrlSearchParams ? (body as any) : JSON.stringify(body)) : undefined,
    });

    // ── 401 → clear session and redirect to login ───────────────
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
      localStorage.clear();
      window.location.reload();
      // Redirect straight to the login page and replace history so back doesn't return to protected pages
      throw new HttpError(401, 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      const parsed = await parseError(response);
      throw parsed;
    }

    // ── 204 No Content ──────────────────────────────────────────
    if (response.status === 204) {
      return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
  } finally {
    unblock();
  }
}

// ── Convenience methods ──────────────────────────────────────────
export const http = {
  get: <TResponse = unknown>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse>(path, { ...options, method: 'GET' }),

  post: <TResponse = unknown, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse, TBody>(path, { ...options, method: 'POST', body }),

  put: <TResponse = unknown, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse, TBody>(path, { ...options, method: 'PUT', body }),

  patch: <TResponse = unknown, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse, TBody>(path, { ...options, method: 'PATCH', body }),

  delete: <TResponse = unknown>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse>(path, { ...options, method: 'DELETE' }),
};
