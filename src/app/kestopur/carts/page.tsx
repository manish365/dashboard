'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Calendar, DollarSign } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpStatCard } from '@/components/kestopur/ui';

interface Cart { cartId: string; customerId: string; items?: any[]; subtotal?: number; discountAmount?: number; finalAmount?: number; updatedAt: string; isAbandoned?: boolean; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

export default function CartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { kpFetch('/wp-admin/carts').then(r => setCarts(Array.isArray(r.data) ? r.data : [])).catch(() => setCarts([])).finally(() => setLoading(false)); }, []);

  const filtered = carts.filter(c => {
    const matchSearch = c.customerId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === 'abandoned' ? c.isAbandoned : !c.isAbandoned);
    return matchSearch && matchStatus;
  });

  const cols = [
    { key: 'customer', label: 'Customer', render: (c: Cart) => <span className="text-sm font-mono" style={{ color: 'var(--text-color)' }}>{c.customerId?.slice(0, 12)}...</span> },
    { key: 'items', label: 'Items', render: (c: Cart) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{c.items?.length || 0}</span> },
    { key: 'subtotal', label: 'Subtotal', render: (c: Cart) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{fmt(c.subtotal || 0)}</span> },
    { key: 'discount', label: 'Discount', render: (c: Cart) => <span className="text-sm" style={{ color: '#34d399' }}>{c.discountAmount ? `-${fmt(c.discountAmount)}` : '—'}</span> },
    { key: 'total', label: 'Total', render: (c: Cart) => <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{fmt(c.finalAmount || 0)}</span> },
    { key: 'updated', label: 'Last Updated', render: (c: Cart) => <span className="text-sm flex items-center gap-1" style={{ color: 'var(--circle)' }}><Calendar className="h-3.5 w-3.5" />{new Date(c.updatedAt).toLocaleDateString()}</span> },
    { key: 'status', label: 'Status', render: (c: Cart) => <KpBadge label={c.isAbandoned ? 'Abandoned' : 'Active'} variant={c.isAbandoned ? 'warning' : 'active'} /> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Shopping Carts" subtitle="View and manage customer shopping carts" />
      <div className="grid grid-cols-3 gap-4">
        <KpStatCard label="Active Carts" value={carts.filter(c => !c.isAbandoned).length} icon={ShoppingCart} color="#34d399" />
        <KpStatCard label="Abandoned" value={carts.filter(c => c.isAbandoned).length} icon={ShoppingCart} color="#fbbf24" />
        <KpStatCard label="Total Value" value={fmt(carts.reduce((s, c) => s + (c.finalAmount || 0), 0))} icon={DollarSign} color="#60a5fa" />
      </div>
      <div className="flex gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search by customer ID..." className="flex-1 max-w-sm" />
        <KpSelect value={statusFilter} onChange={setStatusFilter}>
          <option value="" style={{ background: 'var(--navbar-carousel-color)' }}>All Carts</option>
          <option value="active" style={{ background: 'var(--navbar-carousel-color)' }}>Active</option>
          <option value="abandoned" style={{ background: 'var(--navbar-carousel-color)' }}>Abandoned</option>
        </KpSelect>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={c => c.cartId} emptyMsg="No carts found." />}</KpCard>
    </div>
  );
}
