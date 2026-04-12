'use client';
import { useState, useEffect } from 'react';
import { Gift, Plus, Calendar, DollarSign, User } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton, KpBtn, KpStatCard } from '@/components/kestopur/ui';

interface GiftCard { giftCardId: string; giftCardCode: string; customerId?: string; initialBalance: number; currentBalance: number; isActive: boolean; issuedAt: string; expiresAt?: string; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

export default function GiftCardsPage() {
  const [items, setItems] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { kpFetch('/gift-cards').then(r => setItems(Array.isArray(r.data) ? r.data : [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = items.filter(g => g.giftCardCode?.toLowerCase().includes(search.toLowerCase()) || g.customerId?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'code', label: 'Code', render: (g: GiftCard) => <div className="flex items-center gap-2"><Gift className="h-4 w-4 theme-text-orange" /><span className="text-sm font-mono font-medium theme-text">{g.giftCardCode}</span></div> },
    { key: 'customer', label: 'Customer', render: (g: GiftCard) => <span className="text-sm flex items-center gap-1 theme-text-muted"><User className="h-3.5 w-3.5" />{g.customerId?.slice(0, 12) || '—'}...</span> },
    { key: 'initial', label: 'Initial', render: (g: GiftCard) => <span className="text-sm theme-text-muted">{fmt(g.initialBalance)}</span> },
    { key: 'balance', label: 'Balance', render: (g: GiftCard) => <span className="text-sm font-semibold theme-text-neon">{fmt(g.currentBalance)}</span> },
    { key: 'issued', label: 'Issued', render: (g: GiftCard) => <span className="text-sm flex items-center gap-1 theme-text-subtle"><Calendar className="h-3.5 w-3.5" />{new Date(g.issuedAt).toLocaleDateString()}</span> },
    { key: 'expires', label: 'Expires', render: (g: GiftCard) => <span className="text-sm theme-text-subtle">{g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : 'No expiry'}</span> },
    { key: 'status', label: 'Status', render: (g: GiftCard) => <KpBadge label={g.isActive && g.currentBalance > 0 ? 'Active' : 'Inactive'} variant={g.isActive && g.currentBalance > 0 ? 'active' : 'inactive'} /> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Gift Cards" subtitle="Issue and manage gift cards" action={<KpBtn><Plus className="h-4 w-4" /> Issue Gift Card</KpBtn>} />
      <div className="grid grid-cols-3 gap-4">
        <KpStatCard label="Total Gift Cards" value={items.length} icon={Gift} variant="orange" />
        <KpStatCard label="Active" value={items.filter(g => g.isActive && g.currentBalance > 0).length} icon={Gift} variant="success" />
        <KpStatCard label="Total Value" value={fmt(items.reduce((s, g) => s + (g.currentBalance || 0), 0))} icon={DollarSign} variant="info" />
      </div>
      <KpSearch value={search} onChange={setSearch} placeholder="Search by code or customer ID..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : items.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-20 theme-text-subtle" />
            <p className="text-sm mb-3 theme-text-muted">No gift cards issued yet.</p>
            <KpBtn><Plus className="h-4 w-4" /> Issue First Gift Card</KpBtn>
          </div>
        ) : <KpTable cols={cols} rows={filtered} rowKey={g => g.giftCardId} emptyMsg="No gift cards found." />}
      </KpCard>
    </div>
  );
}
