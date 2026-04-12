'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '@/lib/roles';
import { isAuthEnabled } from '@/lib/msal-config';
import { LogOut, Menu, ChevronDown, User, Shield, ArrowLeftRight, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav() {
  const { state, dispatch } = useAppStore();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <header className="theme-nav-bg sticky top-0 z-40 flex h-16 items-center justify-between theme-border border-b px-4 backdrop-blur-xl lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="theme-text-muted rounded-lg p-2 transition-colors hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="theme-neon-bg theme-text-on-neon flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
            W
          </div>
          <div className="hidden sm:block">
            <h1 className="theme-text text-sm font-bold leading-tight">weboffice</h1>
            <p className="theme-text-muted text-[10px] leading-tight">Management Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="theme-input-bg theme-border flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:bg-white/5 active:scale-95"
          title={mounted ? (state.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode') : ''}
        >
          {!mounted ? (
            <div className="h-4 w-4" />
          ) : state.theme === 'light' ? (
            <Moon className="h-4 w-4 theme-text-subtle" />
          ) : (
            <Sun className="h-4 w-4 theme-text-warning" />
          )}
        </button>

        {mounted && user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
            >
              <div className="theme-neon-bg theme-text-on-neon flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left md:block">
                <p className="theme-text text-sm font-medium leading-tight">{user.name}</p>
                <p className="theme-text-muted text-[10px] leading-tight">{user.email}</p>
              </div>
              <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold md:inline-block ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
              <ChevronDown className="theme-text-muted h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="theme-dropdown-bg absolute right-0 top-full mt-2 w-64 rounded-xl border p-2 shadow-2xl backdrop-blur-xl">
                <div className="theme-border-header border-b px-3 py-2.5 mb-1">
                  <div className="flex items-center gap-2">
                    <User className="theme-text-muted h-4 w-4" />
                    <div>
                      <p className="theme-text text-sm font-medium">{user.name}</p>
                      <p className="theme-text-muted text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[user.role]}`}>
                    <Shield className="h-3 w-3" />
                    {ROLE_LABELS[user.role]}
                  </div>
                </div>

                <button
                  onClick={handleRoleSwitch}
                  className="theme-text-link flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Switch to {user.role === UserRole.DATA_MANAGER ? 'Approver' : 'Data Manager'}
                </button>

                {user && (
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm theme-text-danger transition-colors hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
