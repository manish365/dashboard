'use client';
import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpBtn, KpStatCard } from '@/components/kestopur/ui';

interface Coupon { couponId: string; couponCode: string; couponName: string; couponType: string; discountValue: number; timesUsed?: number; usageLimit?: number; validUntil?: string; isActive: boolean; }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const fetch = async () => { setLoading(true); const r = await kpFetch('/wp-admin/coupons'); setCoupons(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await kpFetch(`/wp-admin/coupons/${id}`, { method: 'DELETE' }); fetch(); };

  const filtered = coupons.filter(c => {
    const matchSearch = c.couponCode?.toLowerCase().includes(search.toLowerCase()) || c.couponName?.toLowerCase().includes(search.toLowerCase());
    const matchActive = !activeFilter || (activeFilter === 'true' ? c.isActive : !c.isActive);
    return matchSearch && matchActive;
  });

  const cols = [
    { key: 'code', label: 'Code', render: (c: Coupon) => <div className="flex items-center gap-2"><Tag className="h-4 w-4" style={{ color: '#60a5fa' }} /><span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{c.couponCode}</span></div> },
    { key: 'name', label: 'Name', render: (c: Coupon) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{c.couponName}</span> },
    { key: 'type', label: 'Type', render: (c: Coupon) => <span className="text-sm capitalize" style={{ color: 'var(--old-price)' }}>{c.couponType?.replace('_', ' ')}</span> },
    { key: 'value', label: 'Value', render: (c: Coupon) => <span className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-color)' }}>{c.couponType === 'percentage_discount' ? <><Percent className="h-3.5 w-3.5" />{c.discountValue}%</> : <><DollarSign className="h-3.5 w-3.5" />₹{c.discountValue}</>}</span> },
    { key: 'usage', label: 'Usage', render: (c: Coupon) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{c.timesUsed || 0} / {c.usageLimit || '∞'}</span> },
    { key: 'expiry', label: 'Valid Until', render: (c: Coupon) => <span className="text-sm flex items-center gap-1" style={{ color: 'var(--circle)' }}><Calendar className="h-3.5 w-3.5" />{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'No expiry'}</span> },
    { key: 'status', label: 'Status', render: (c: Coupon) => <KpBadge label={c.isActive ? 'Active' : 'Inactive'} variant={c.isActive ? 'active' : 'inactive'} /> },
    { key: 'actions', label: 'Actions', align: 'right' as const, render: (c: Coupon) => <button onClick={() => handleDelete(c.couponId)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Coupons & Promotions" subtitle="Manage discount coupons and promotional codes" action={<KpBtn><Plus className="h-4 w-4" /> Create Coupon</KpBtn>} />
      <div className="grid grid-cols-3 gap-4">
        <KpStatCard label="Total Coupons" value={coupons.length} icon={Tag} color="#60a5fa" />
        <KpStatCard label="Active" value={coupons.filter(c => c.isActive).length} icon={Tag} color="#34d399" />
        <KpStatCard label="Inactive" value={coupons.filter(c => !c.isActive).length} icon={Tag} color="var(--circle)" />
      </div>
      <div className="flex gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search coupons..." className="flex-1 max-w-sm" />
        <KpSelect value={activeFilter} onChange={setActiveFilter}>
          <option value="" style={{ background: 'var(--navbar-carousel-color)' }}>All Coupons</option>
          <option value="true" style={{ background: 'var(--navbar-carousel-color)' }}>Active Only</option>
          <option value="false" style={{ background: 'var(--navbar-carousel-color)' }}>Inactive Only</option>
        </KpSelect>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={c => c.couponId} emptyMsg="No coupons found." />}</KpCard>
    </div>
  );
}
