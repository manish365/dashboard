'use client';

import { useCallback, useMemo } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, isAuthEnabled } from '@/lib/msal-config';
import { UserInfo, UserRole, assignRole, MOCK_USER } from '@/lib/roles';

export function useAuth() {
  // When auth is disabled, return mock user
  if (!isAuthEnabled) {
    return {
      isAuthenticated: true,
      user: MOCK_USER,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      switchRole: null as unknown as (role: UserRole) => void,
    };
  }

  return useAuthMsal();
}

function useAuthMsal() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const user: UserInfo | null = useMemo(() => {
    if (accounts.length === 0) return null;
    const account = accounts[0];
    return {
      name: account.name || 'Unknown User',
      email: account.username || '',
      role: assignRole(account.username || ''),
    };
  }, [accounts]);

  const login = useCallback(async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [instance]);

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}
