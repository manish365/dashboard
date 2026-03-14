'use client';

import React from 'react';
import { AppProvider } from '@/stores/app-store';
import MsalAppProvider from '@/providers/msal-provider';
import AuthGuard from '@/components/auth/auth-guard';
import TopNav from '@/components/layout/top-nav';
import Sidebar from '@/components/layout/sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <MsalAppProvider>
        <AuthGuard>
          <LayoutShell>{children}</LayoutShell>
        </AuthGuard>
      </MsalAppProvider>
    </AppProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ background: 'var(--text-color-black)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
