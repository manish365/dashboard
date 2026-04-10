'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import {
  LayoutDashboard,
  CheckSquare,
  X,
  Star,
  Target,
  FileSpreadsheet,
  Users,
  ShoppingCart,
  MapPin,
  Layout,
  Box,
  BarChart3,
  Sprout,
  MessageSquare,
  FlaskConical,
  Video,
  BookOpen,
  GraduationCap,
  Map,
  Table2,
  Store,
  Package,
  ShieldCheck,
  Headphones,
  GitBranch,
  Tag,
  Ticket,
  Layers,
  Settings2,
  Mail,
  Truck,
  FileText,
  ClipboardList,
  Settings,
  History,
  Archive,
  CreditCard,
  UserPlus,
  TreePalm,
  Building2,
} from 'lucide-react';

import { NAV_SECTIONS } from '@/config/navigation';

const NavLink = React.memo(({ item, isActive, isOpen, onClick }: { item: any; isActive: boolean; isOpen: boolean; onClick: () => void }) => {
  return (
    <Link
      href={item.href}
      title={!isOpen ? item.label : undefined}
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${isActive
        ? 'text-[var(--neon-green)]'
        : 'hover:bg-white/5'
        } ${!isOpen ? 'justify-center px-2' : ''}`}
      style={{
        background: isActive ? 'rgba(0, 233, 191, 0.08)' : undefined,
        color: isActive ? 'var(--neon-green)' : 'var(--old-price)',
        ...(item.highlight && !isActive ? { border: '1px solid rgba(0, 233, 191, 0.2)', background: 'rgba(0, 233, 191, 0.03)' } : {})
      }}
    >
      <item.icon
        className={`h-4 w-4 shrink-0 transition-colors ${item.highlight ? 'animate-pulse' : ''}`}
        style={{
          color: isActive || item.highlight ? 'var(--neon-green)' : 'var(--circle)',
        }}
      />
      {isOpen && (
        <span className="truncate transition-opacity duration-300 opacity-100">
          {item.label}
        </span>
      )}
      {isActive && isOpen && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'var(--neon-green)' }} />
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
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r backdrop-blur-xl transition-all duration-300 lg:relative lg:top-0 lg:z-0 lg:translate-x-0 ${state.sidebarOpen ? 'w-60 translate-x-0' : 'w-16 translate-x-0 lg:w-16 -translate-x-full lg:translate-x-0'
          }`}
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}
      >
        {/* Close button on mobile */}
        <div className="flex items-center justify-end p-3 lg:hidden">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="rounded-lg p-1.5 hover:bg-white/10"
            style={{ color: 'var(--old-price)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
 
        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-[calc(100%-80px)]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-2">
              <p className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest transition-opacity duration-300 ${state.sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                }`}
                style={{ color: 'var(--circle)' }}>
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
 
        {/* Bottom section */}
        <div className={`absolute bottom-0 left-0 right-0 border-t p-3 transition-opacity duration-300 ${state.sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ borderColor: 'var(--border-color)' }}>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(0, 233, 191, 0.05)', borderColor: 'rgba(0, 233, 191, 0.1)', borderWidth: '1px' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--neon-green)' }}>Croma Incentive v1.0</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--circle)' }}>Enterprise Dashboard</p>
          </div>
        </div>
      </aside>
    </>
  );
}
