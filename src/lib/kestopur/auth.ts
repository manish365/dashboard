import { kpFetch, setToken, removeToken } from './api';

export interface KpUser {
  id: string;
  name: string;
  email: string;
  nicename?: string;
  displayName?: string;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export async function login(username: string, password: string) {
  // Using standard WordPress JWT Auth endpoint pattern as default
  const res = await kpFetch('/wp-json/jwt-auth/v1/token', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    useCache: false
  });

  if (res.success && res.data?.token) {
    setToken(res.data.token);
    return {
      success: true,
      user: {
        id: res.data.user_email,
        name: res.data.user_display_name || res.data.user_nicename,
        email: res.data.user_email,
        nicename: res.data.user_nicename,
        displayName: res.data.user_display_name
      } as KpUser
    };
  }

  return {
    success: false,
    error: res.error || 'Invalid credentials'
  };
}

export function logout() {
  removeToken();
}

export async function getProfile() {
  const res = await kpFetch('/wp-admin/profile', { useCache: false });
  if (res.success) {
    return { success: true, user: res.data as KpUser };
  }
  return { success: false, error: res.error };
}
