'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '@/lib/roles';
import { isAuthEnabled } from '@/lib/msal-config';
import {
  LogOut,
  Menu,
  ChevronDown,
  User,
  Shield,
  ArrowLeftRight,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav() {
  const { state, dispatch } = useAppStore();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = state.user;

  const handleRoleSwitch = () => {
    const newRole = user?.role === UserRole.DATA_MANAGER ? UserRole.APPROVER : UserRole.DATA_MANAGER;
    dispatch({ type: 'SET_ROLE', payload: newRole });
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 px-4 backdrop-blur-xl lg:px-6"
      style={{ background: 'var(--foot-color)' }}>
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="rounded-lg p-2 text-[var(--old-price)] transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-[var(--text-color-black)]"
            style={{ background: 'var(--neon-green)' }}>
            C
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-tight">Croma Incentive</h1>
            <p className="text-[10px] leading-tight" style={{ color: 'var(--old-price)' }}>Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Right: user menu */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-[var(--text-color-black)]"
              style={{ background: 'var(--neon-green)' }}>
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
              <p className="text-[10px] leading-tight" style={{ color: 'var(--old-price)' }}>{user.email}</p>
            </div>
            <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold md:inline-block ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--old-price)' }} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 p-2 shadow-2xl backdrop-blur-xl"
              style={{ background: 'var(--navbar-carousel-color)' }}>
              {/* User info */}
              <div className="border-b border-white/10 px-3 py-2.5 mb-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" style={{ color: 'var(--old-price)' }} />
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--old-price)' }}>{user.email}</p>
                  </div>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[user.role]}`}>
                  <Shield className="h-3 w-3" />
                  {ROLE_LABELS[user.role]}
                </div>
              </div>

              {/* Switch role */}
              <button
                onClick={handleRoleSwitch}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--hyperlink)' }}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Switch to {user.role === UserRole.DATA_MANAGER ? 'Approver' : 'Data Manager'}
              </button>

              {/* Logout */}
              {isAuthEnabled && (
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
