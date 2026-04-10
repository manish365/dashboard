'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Award } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpPagination, KpBtn, KpModal, KpField } from '@/components/kestopur/ui';

interface Customer { id: string; first_name: string; last_name: string; email: string; phone?: string; status: string; tier: string; total_orders?: number; total_spent?: number; }

const STATUSES = ['', 'prospect', 'active', 'inactive', 'suspended', 'churned', 'banned'];
const TIERS = ['', 'basic', 'silver', 'gold', 'platinum', 'vip'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: '10', ...(statusFilter && { status: statusFilter }), ...(tierFilter && { tier: tierFilter }), ...(search && { search }) });
    const r = await kpFetch(`/wp-admin/customers?${params}`);
    setCustomers(r.data?.data || r.data || []);
    setPagination(p => ({ ...p, total: r.data?.total || 0, totalPages: r.data?.totalPages || 0 }));
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [pagination.page, statusFilter, tierFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    await kpFetch(`/wp-admin/customers/${id}`, { method: 'DELETE' });
    fetchCustomers();
  };

  const cols = [
    {
      key: 'info', label: 'Customer', render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
            {c.first_name?.[0] || '?'}{c.last_name?.[0] || ''}
          </div>
          <div>
            <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-color)' }}>{c.first_name} {c.last_name}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--circle)' }}>{c.id?.split('-')[0]}...</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact', label: 'Contact', render: (c: Customer) => (
        <div className="space-y-0.5">
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--old-price)' }}><Mail className="h-3 w-3" />{c.email}</p>
          {c.phone && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--old-price)' }}><Phone className="h-3 w-3" />{c.phone}</p>}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status / Tier', render: (c: Customer) => (
        <div className="space-y-1">
          <KpBadge label={c.status} variant={c.status} />
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--circle)' }}><Award className="h-3 w-3 text-yellow-500" />{c.tier} Tier</p>
        </div>
      ),
    },
    {
      key: 'engagement', label: 'Engagement', render: (c: Customer) => (
        <div className="text-xs space-y-0.5" style={{ color: 'var(--old-price)' }}>
          <p>Orders: <span className="font-bold" style={{ color: 'var(--text-color)' }}>{c.total_orders || 0}</span></p>
          <p>Spent: <span className="font-bold" style={{ color: 'var(--text-color)' }}>₹{c.total_spent || 0}</span></p>
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (c: Customer) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setSelected(c); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#f87171' }}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Customers" subtitle="Manage buyers, membership tiers, and lifecycle statuses"
        action={<KpBtn onClick={() => { setSelected(null); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Customer</KpBtn>} />

      <div className="flex flex-wrap gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search by name, email..." className="flex-1 max-w-sm" />
        <KpSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
          {STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--navbar-carousel-color)' }}>{s || 'All Statuses'}</option>)}
        </KpSelect>
        <KpSelect value={tierFilter} onChange={v => { setTierFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
          {TIERS.map(t => <option key={t} value={t} style={{ background: 'var(--navbar-carousel-color)' }}>{t || 'All Tiers'}</option>)}
        </KpSelect>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={customers} rowKey={c => c.id} emptyMsg="No customers found." />}
        <KpPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit}
          onPage={p => setPagination(prev => ({ ...prev, page: p }))} />
      </div>

      {showModal && (
        <KpModal title={selected ? 'Edit Customer' : 'Add Customer'} onClose={() => setShowModal(false)}>
          <p className="text-sm mb-4" style={{ color: 'var(--old-price)' }}>Customer form — connect to backend API to enable full CRUD.</p>
          <button onClick={() => setShowModal(false)} className="w-full rounded-xl py-2.5 text-sm border hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Close</button>
        </KpModal>
      )}
    </div>
  );
}
