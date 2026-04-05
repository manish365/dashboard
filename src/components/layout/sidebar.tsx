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
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/approvals', label: 'Approvals', icon: CheckSquare },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { href: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
    ],
  },
  {
    title: 'Data Management',
    items: [
      { href: '/data/csat', label: 'CSAT Data', icon: Star },
      { href: '/data/volume-budget', label: 'Volume Budget', icon: Target },
      { href: '/data/main-template', label: 'Main Template', icon: FileSpreadsheet },
      { href: '/data/sm-mo-mapping', label: 'SM MO Mapping', icon: MapPin },
      { href: '/data/vas-sku', label: 'VAS SKU', icon: ShoppingCart },
      { href: '/data/employee-master', label: 'Employee Master', icon: Users },
    ],
  },
  {
    title: 'Reference Data',
    items: [
      { href: '/reference/stores', label: 'Stores', icon: MapPin },
      { href: '/reference/groups', label: 'Groups & Categories', icon: FileSpreadsheet },
      { href: '/reference/employees', label: 'Employee Directory', icon: Users },
    ],
  },
  {
    title: 'AgroPilot AI',
    items: [
      { href: '/agropilot/dashboard', label: 'Farm Dashboard', icon: Sprout },
      { href: '/agropilot/chat', label: 'AI Assistant', icon: MessageSquare },
      { href: '/agropilot/analysis', label: 'Crop Analysis', icon: FlaskConical },
    ],
  },
  {
    title: 'LearnPath',
    items: [
      { href: '/learnpath/admin', label: 'Admin Dashboard', icon: BookOpen },
      { href: '/learnpath/admin/roadmaps', label: 'Roadmaps', icon: Map },
      { href: '/learnpath/admin/users', label: 'Users', icon: Users },
      { href: '/learnpath/learner', label: 'Learner Catalog', icon: GraduationCap },
      { href: '/learnpath/datagrid', label: 'Invoice Grid', icon: Table2 },
      { href: '/learnpath/datagrid/employees', label: 'Employee Grid', icon: Users },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { href: '/video-creator', label: 'Video Creator', icon: Video },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/ui-showcase', label: 'UI Showcase', icon: Layout },
      { href: '/builder', label: 'Page Builder', icon: Box },
    ],
  },
];

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
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!state.sidebarOpen ? item.label : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) dispatch({ type: 'TOGGLE_SIDEBAR' });
                    }}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${isActive
                        ? 'text-[var(--neon-green)]'
                        : 'hover:bg-white/5'
                      } ${!state.sidebarOpen ? 'justify-center px-2' : ''}`}
                    style={{
                      background: isActive ? 'rgba(0, 233, 191, 0.08)' : undefined,
                      color: isActive ? 'var(--neon-green)' : 'var(--old-price)',
                    }}
                  >
                    <item.icon
                      className="h-4 w-4 shrink-0 transition-colors"
                      style={{
                        color: isActive ? 'var(--neon-green)' : 'var(--circle)',
                      }}
                    />
                    {state.sidebarOpen && (
                      <span className="truncate transition-opacity duration-300 opacity-100">
                        {item.label}
                      </span>
                    )}
                    {isActive && state.sidebarOpen && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'var(--neon-green)' }} />
                    )}
                  </Link>
                );
              })}
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
