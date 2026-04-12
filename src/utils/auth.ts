'use client';
import Cookies from 'js-cookie';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return Cookies.get('kp_authToken') || null;
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    Cookies.set('kp_authToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    Cookies.remove('kp_authToken', { path: '/' });
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const currentToken = getToken();
    if (!currentToken) return null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        return data.access_token;
      }
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

export const logout = (): void => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
