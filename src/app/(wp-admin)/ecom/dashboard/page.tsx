'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, Package, DollarSign, Shield, GitBranch, ArrowRight, Building2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpStatCard, KpCard } from '@/components/kestopur/ui';

const QUICK_ACTIONS = [
  { href: '/ecom/users', label: 'Manage Users', desc: 'View, create, edit, and delete users', icon: Users, tagCls: 'theme-tag-accent', textCls: 'theme-text-accent' },
  { href: '/ecom/roles', label: 'Manage Roles', desc: 'Create roles and assign permissions', icon: Shield, tagCls: 'theme-tag-success', textCls: 'theme-text-success' },
  { href: '/ecom/orders', label: 'View Orders', desc: 'Track and manage customer orders', icon: ShoppingCart, tagCls: 'theme-tag-warning', textCls: 'theme-text-warning' },
  { href: '/ecom/kpi-tree', label: 'KPI Explorer', desc: 'Explore operational drilldowns', icon: GitBranch, tagCls: 'theme-tag-info', textCls: 'theme-text-info' },
  { href: '/ecom/customers', label: 'B2B Management', desc: 'Manage corporate accounts', icon: Building2, tagCls: 'theme-tag-purple', textCls: 'theme-text-purple' },
  { href: '/ecom/products', label: 'Products', desc: 'Manage your product catalog', icon: Package, tagCls: 'theme-tag-danger', textCls: 'theme-text-danger' },
];

export default function KestopurDashboard() {
  const [stats, setStats] = useState({ totalUsers: 150, totalOrders: 1250, totalProducts: 89, totalRevenue: 45000 });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    kpFetch('/stats').then(r => {
      if (r.success && r.data) setStats(r.data);
      else if (!r.success) showToast(r.error || 'Failed to load dashboard stats', 'error');
      setLoading(false);
    });
  }, [showToast]);

  return (
    <div className="space-y-6">
      <KpPageHeader title="Kestopur Dashboard" subtitle="Welcome to your e-commerce admin panel" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpStatCard label="Total Users" value={stats.totalUsers} icon={Users} variant="accent" loading={loading} />
        <KpStatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} variant="warning" loading={loading} />
        <KpStatCard label="Total Products" value={stats.totalProducts} icon={Package} variant="danger" loading={loading} />
        <KpStatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} variant="success" loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KpCard>
          <div className="theme-border px-5 py-4 border-b">
            <span className="theme-text font-semibold text-sm">Recent Activity</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'New user registered', time: '2 hours ago' },
              { label: 'Order #1234 completed', time: '4 hours ago' },
              { label: 'Product updated', time: '6 hours ago' },
              { label: 'Role permissions changed', time: '1 day ago' },
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
            {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, tagCls, textCls }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className={`rounded-lg p-2 flex-shrink-0 ${tagCls}`}>
                  <Icon className={`h-4 w-4 ${textCls}`} />
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
