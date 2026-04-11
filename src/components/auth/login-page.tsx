'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Monitor } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="theme-main-bg flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="theme-login-glow-1 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="theme-login-glow-2 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="theme-card-bg rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="theme-neon-bg theme-neon-glow flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
              <Monitor className="theme-text-on-neon h-8 w-8" />
            </div>
            <div className="text-center">
              <h1 className="theme-text text-2xl font-bold">weboffice</h1>
              <p className="theme-text-muted mt-1 text-sm">Management Dashboard</p>
            </div>
          </div>

          <div className="theme-login-divider mb-6 h-px" />

          <button
            onClick={login}
            className="theme-btn-neon group flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5 font-semibold transition-all active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 21 21" fill="currentColor">
              <rect x="1" y="1" width="9" height="9" />
              <rect x="11" y="1" width="9" height="9" />
              <rect x="1" y="11" width="9" height="9" />
              <rect x="11" y="11" width="9" height="9" />
            </svg>
            Sign in with Microsoft
          </button>

          <div className="theme-text-subtle mt-6 flex items-center justify-center gap-2 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Secured by Azure Active Directory</span>
          </div>
        </div>

        <p className="theme-text-subtle mt-6 text-center text-xs">
          © {new Date().getFullYear()} Store — A TATA Enterprise
        </p>
      </div>
    </div>
  );
}
