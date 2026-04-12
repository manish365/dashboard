'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/app-store';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, user } = useAuth();
  const { state, dispatch } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give some time for the AppProvider to restore the session on mount
    const timer = setTimeout(() => {
      setChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pathname === '/login') return;

    if (!checking && !isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isAuthenticated, checking, pathname, router]);

  // Public pages
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Still verifying session on mount
  if (checking || (!isAuthenticated && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center theme-main-bg">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--neon-green)] opacity-20 blur-2xl animate-pulse rounded-full" />
          <Loader2 className="h-12 w-12 animate-spin theme-text-neon relative z-10" />
        </div>
        <p className="theme-text mt-4 text-xs font-bold uppercase tracking-[0.2em] opacity-50">
          Enforcing Security Protocol
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
