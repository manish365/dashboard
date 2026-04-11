'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { X } from 'lucide-react';
import { NAV_SECTIONS } from '@/config/navigation';

const NavLink = React.memo(({ item, isActive, isOpen, onClick }: { item: any; isActive: boolean; isOpen: boolean; onClick: () => void }) => {
  return (
    <Link
      href={item.href}
      title={!isOpen ? item.label : undefined}
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all
        ${isActive ? 'theme-nav-active' : 'theme-text-muted hover:bg-white/5'}
        ${item.highlight && !isActive ? 'theme-nav-highlight' : ''}
        ${!isOpen ? 'justify-center px-2' : ''}`}
    >
      <item.icon
        className={`h-4 w-4 shrink-0 transition-colors ${item.highlight ? 'animate-pulse' : ''}
          ${isActive || item.highlight ? 'theme-nav-icon-active' : 'theme-nav-icon'}`}
      />
      {isOpen && (
        <span className="truncate transition-opacity duration-300 opacity-100">
          {item.label}
        </span>
      )}
      {isActive && isOpen && (
        <div className="theme-nav-dot ml-auto h-1.5 w-1.5 rounded-full" />
      )}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export default function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useAppStore();

  return (
    <>
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        />
      )}

      <aside
        className={`theme-sidebar-bg fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r backdrop-blur-xl transition-all duration-300 lg:relative lg:top-0 lg:z-0 lg:translate-x-0
          ${state.sidebarOpen ? 'w-60 translate-x-0' : 'w-16 translate-x-0 lg:w-16 -translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-end p-3 lg:hidden">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="theme-text-muted rounded-lg p-1.5 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-[calc(100%-80px)]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-2">
              <p className={`theme-nav-section mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest transition-opacity duration-300
                ${state.sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isOpen={state.sidebarOpen}
                  isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                  onClick={() => {
                    if (window.innerWidth < 1024) dispatch({ type: 'TOGGLE_SIDEBAR' });
                  }}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 theme-border border-t p-3 transition-opacity duration-300
          ${state.sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="theme-version-badge rounded-lg p-2.5">
            <p className="theme-text-neon text-xs font-medium">weboffice v1.0</p>
            <p className="theme-text-subtle text-[10px] mt-0.5">Enterprise Dashboard</p>
          </div>
        </div>
      </aside>
    </>
  );
}
