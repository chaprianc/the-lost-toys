import { supabase } from '@/integrations/supabase/client';

const ADMIN_SESSION_KEY = 'adminSessionToken';
export const ADMIN_SESSION_EXPIRED_EVENT = 'admin-session-expired';

export class AdminApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AdminApiError';
    this.code = code;
  }
}

export const getAdminSessionToken = () => sessionStorage.getItem(ADMIN_SESSION_KEY);

export const clearAdminSession = () => {
  const hadSession = Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY));
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  if (hadSession) window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
};

export const loginAdmin = async (password: string) => {
  const { data, error } = await supabase.functions.invoke('verify-admin-password', {
    body: { password },
  });

  if (error || !data?.success || typeof data.token !== 'string') {
    const message = data?.error === 'Too many attempts'
      ? 'יותר מדי ניסיונות. נסה שוב בעוד 15 דקות.'
      : 'סיסמה שגויה';
    throw new AdminApiError(message, data?.error);
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, data.token);
  return data as { success: true; token: string; expiresAt: string };
};

export const adminRequest = async <T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> => {
  const token = getAdminSessionToken();
  if (!token) throw new AdminApiError('נדרשת התחברות מחדש', 'session_missing');

  const { data, error } = await supabase.functions.invoke('admin-api', {
    headers: { 'x-admin-session': token },
    body: { action, ...payload },
  });

  if (error || data?.error) {
    const code = data?.code;
    if (code === 'session_invalid' || code === 'session_expired') clearAdminSession();
    throw new AdminApiError(data?.error || 'פעולת הניהול נכשלה', code);
  }

  return data as T;
};

export const logoutAdmin = async () => {
  try {
    if (getAdminSessionToken()) await adminRequest('logout');
  } catch {
    // Local logout must still complete if the session already expired.
  } finally {
    clearAdminSession();
  }
};
