'use client';

import { useCallback, useMemo } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, isAuthEnabled } from '@/lib/msal-config';
import { UserInfo, UserRole, assignRole } from '@/lib/roles';
import { useAppStore } from '@/stores/app-store';
import { useRouter } from 'next/navigation';
import { logout as kpLogout } from '@/lib/kestopur/auth';

export function useAuth() {
  const { state, dispatch } = useAppStore();
  const router = useRouter();
  
  // When Microsoft Entra ID (MSAL) is disabled, use Kestopur JWT Auth
  if (!isAuthEnabled) {
    return {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      login: () => router.push('/login'),
      logout: () => {
        kpLogout();
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        router.push('/login');
      },
      switchRole: (role: UserRole) => dispatch({ type: 'SET_ROLE', payload: role }),
    };
  }

  return useAuthMsal();
}

function useAuthMsal() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { state, dispatch } = useAppStore();

  const user: UserInfo | null = useMemo(() => {
    if (accounts.length === 0) return state.user; // Fallback to store if available
    const account = accounts[0];
    return {
      name: account.name || 'Unknown User',
      email: account.username || '',
      role: assignRole(account.username || ''),
    };
  }, [accounts, state.user]);

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
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [instance, dispatch]);

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}
