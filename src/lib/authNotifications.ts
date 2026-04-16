const AUTH_NOTIFICATION_KEY = 'auth-notification';

export interface AuthNotification {
  type: 'success' | 'error';
  message: string;
}

export function setAuthNotification(notification: AuthNotification) {
  sessionStorage.setItem(AUTH_NOTIFICATION_KEY, JSON.stringify(notification));
}

export function consumeAuthNotification(): AuthNotification | null {
  const rawNotification = sessionStorage.getItem(AUTH_NOTIFICATION_KEY);

  if (!rawNotification) {
    return null;
  }

  sessionStorage.removeItem(AUTH_NOTIFICATION_KEY);

  try {
    return JSON.parse(rawNotification) as AuthNotification;
  } catch {
    return null;
  }
}