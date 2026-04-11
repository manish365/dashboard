'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, Package, DollarSign, Shield, GitBranch, ArrowRight, Building2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpStatCard, KpCard } from '@/components/kestopur/ui';

const QUICK_ACTIONS = [
  { href: '/kestopur/users',     label: 'Manage Users',   desc: 'View, create, edit, and delete users',    icon: Users,     color: '#818cf8' },
  { href: '/kestopur/roles',     label: 'Manage Roles',   desc: 'Create roles and assign permissions',     icon: Shield,    color: '#34d399' },
  { href: '/kestopur/orders',    label: 'View Orders',    desc: 'Track and manage customer orders',        icon: ShoppingCart, color: '#fbbf24' },
  { href: '/kestopur/kpi-tree',  label: 'KPI Explorer',   desc: 'Explore operational drilldowns',          icon: GitBranch, color: '#60a5fa' },
  { href: '/kestopur/customers', label: 'B2B Management', desc: 'Manage corporate accounts',               icon: Building2, color: '#a78bfa' },
  { href: '/kestopur/products',  label: 'Products',       desc: 'Manage your product catalog',             icon: Package,   color: '#f87171' },
];

export default function KestopurDashboard() {
  const [stats, setStats] = useState({ totalUsers: 150, totalOrders: 1250, totalProducts: 89, totalRevenue: 45000 });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    kpFetch('/wp-admin/stats').then(r => {
      if (r.success && r.data) setStats(r.data);
      else if (!r.success) showToast(r.error || 'Failed to load dashboard stats', 'error');
      setLoading(false);
    });
  }, [showToast]);

  return (
    <div className="space-y-6">
      <KpPageHeader title="Kestopur Dashboard" subtitle="Welcome to your e-commerce admin panel" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpStatCard label="Total Users"    value={stats.totalUsers}    icon={Users}        color="#818cf8" loading={loading} />
        <KpStatCard label="Total Orders"   value={stats.totalOrders}   icon={ShoppingCart} color="#fbbf24" loading={loading} />
        <KpStatCard label="Total Products" value={stats.totalProducts} icon={Package}      color="#f87171" loading={loading} />
        <KpStatCard label="Revenue"        value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="#34d399" loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KpCard>
          <div className="theme-border px-5 py-4 border-b">
            <span className="theme-text font-semibold text-sm">Recent Activity</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'New user registered',       time: '2 hours ago' },
              { label: 'Order #1234 completed',     time: '4 hours ago' },
              { label: 'Product updated',           time: '6 hours ago' },
              { label: 'Role permissions changed',  time: '1 day ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="theme-text-muted text-sm">{item.label}</span>
                <span className="theme-text-subtle text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        </KpCard>

        <KpCard>
          <div className="theme-border px-5 py-4 border-b">
            <span className="theme-text font-semibold text-sm">Quick Actions</span>
          </div>
          <div className="p-4 space-y-2">
            {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                {/* color is dynamic prop — stays as style */}
                <div className="rounded-lg p-2 flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="theme-text text-sm font-medium">{label}</p>
                  <p className="theme-text-muted text-xs truncate">{desc}</p>
                </div>
                <ArrowRight className="theme-text-neon h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </KpCard>
      </div>
    </div>
  );
}
