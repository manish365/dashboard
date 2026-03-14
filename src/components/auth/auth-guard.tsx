'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/app-store';
import LoginPage from '@/components/auth/login-page';
import { isAuthEnabled } from '@/lib/msal-config';
import { MOCK_USER } from '@/lib/roles';

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, user } = useAuth();
  const { state, dispatch } = useAppStore();

  useEffect(() => {
    if (!isAuthEnabled) {
      // Auto-login with mock user when auth is disabled
      if (!state.user) {
        dispatch({ type: 'SET_USER', payload: MOCK_USER });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      }
      return;
    }

    if (isAuthenticated && user) {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    } else {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    }
  }, [isAuthenticated, user, dispatch, state.user]);

  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
