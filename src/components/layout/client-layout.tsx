'use client';

import React, { useEffect } from 'react';
import { AppProvider, useAppStore } from '@/stores/app-store';
import MsalAppProvider from '@/providers/msal-provider';
import AuthGuard from '@/components/auth/auth-guard';
import TopNav from '@/components/layout/top-nav';
import Sidebar from '@/components/layout/sidebar';
import { ToastProvider } from '@/providers/toast-context';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <MsalAppProvider>
        <AuthGuard>
          <ToastProvider>
            <LayoutShell>{children}</LayoutShell>
          </ToastProvider>
        </AuthGuard>
      </MsalAppProvider>
    </AppProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { state } = useAppStore();

  useEffect(() => {
    if (state.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [state.theme]);

  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="theme-main-bg flex-1 overflow-y-auto p-4 lg:p-6 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
