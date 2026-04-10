 'use client'
import Cookies from 'js-cookie';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('authToken') || null;
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    Cookies.set('authToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/wp-admin',
    });
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove('authToken', { path: '/wp-admin' });
  }
};

export const refreshToken = async () => {
  try {
    const currentToken = getToken();
    if (!currentToken) return null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-admin/refresh-token`, {
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

export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/wp-admin/login';
  }
};
