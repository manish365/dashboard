'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Monitor } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--text-color-black)' }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(0, 233, 191, 0.06)' }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(18, 218, 168, 0.06)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl" style={{ background: 'var(--croma-wall)' }}>
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'var(--neon-green)', boxShadow: '0 8px 32px rgba(0, 233, 191, 0.25)' }}>
              <Monitor className="h-8 w-8" style={{ color: 'var(--text-color-black)' }} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Croma Incentive</h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--old-price)' }}>Management Dashboard</p>
            </div>
          </div>

          <div className="mb-6 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--circle), transparent)' }} />

          <button
            onClick={login}
            className="group flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5 font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'var(--neon-green)',
              color: 'var(--text-color-black)',
              boxShadow: '0 4px 24px rgba(0, 233, 191, 0.2)',
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 21 21" fill="currentColor">
              <rect x="1" y="1" width="9" height="9" />
              <rect x="11" y="1" width="9" height="9" />
              <rect x="1" y="11" width="9" height="9" />
              <rect x="11" y="11" width="9" height="9" />
            </svg>
            Sign in with Microsoft
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--circle)' }}>
            <Shield className="h-3.5 w-3.5" />
            <span>Secured by Azure Active Directory</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--circle)' }}>
          © {new Date().getFullYear()} Croma — A TATA Enterprise
        </p>
      </div>
    </div>
  );
}
