'use client';
import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, ExternalLink, ShieldCheck, CreditCard, Plus } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton, KpBtn } from '@/components/kestopur/ui';

interface BizAccount { business_account_id: string; account_name: string; account_number: string; business_type: string; status: string; verification_status?: string; primary_email: string; primary_phone?: string; credit_limit?: number; available_credit?: number; payment_terms_days?: number; }

export default function BusinessAccountsPage() {
  const [items, setItems] = useState<BizAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { kpFetch('/wp-admin/business-accounts').then(r => setItems(Array.isArray(r.data) ? r.data : r.data?.data || [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = items.filter(a => a.account_name?.toLowerCase().includes(search.toLowerCase()) || a.account_number?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'account', label: 'Account', render: (a: BizAccount) => <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{a.account_name?.[0] || 'B'}</div><div><p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{a.account_name}</p><p className="text-xs font-mono" style={{ color: 'var(--circle)' }}>{a.account_number}</p></div></div> },
    { key: 'type', label: 'Type / Status', render: (a: BizAccount) => <div className="space-y-1"><p className="text-sm capitalize" style={{ color: 'var(--old-price)' }}>{a.business_type?.replace('_', ' ')}</p><div className="flex items-center gap-1"><KpBadge label={a.status} variant={a.status} />{a.verification_status === 'verified' && <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#34d399' }} />}</div></div> },
    { key: 'contact', label: 'Contact', render: (a: BizAccount) => <div className="space-y-0.5"><p className="text-xs flex items-center gap-1" style={{ color: 'var(--old-price)' }}><Mail className="h-3 w-3" />{a.primary_email}</p>{a.primary_phone && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--old-price)' }}><Phone className="h-3 w-3" />{a.primary_phone}</p>}</div> },
    { key: 'financials', label: 'Financials', render: (a: BizAccount) => <div className="text-xs space-y-0.5"><p style={{ color: 'var(--old-price)' }}>Limit: <span className="font-bold" style={{ color: 'var(--text-color)' }}>₹{a.credit_limit?.toLocaleString() || 0}</span></p><p style={{ color: '#34d399' }}>Avail: ₹{a.available_credit?.toLocaleString() || 0}</p><p style={{ color: 'var(--circle)' }}>Terms: {a.payment_terms_days || 0}d</p></div> },
    { key: 'actions', label: '', align: 'right' as const, render: () => <button className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--neon-green)' }}><ExternalLink className="h-4 w-4" /></button> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Business Accounts (B2B)" subtitle="Manage corporate accounts, credit limits, and industry associations" action={<KpBtn><Plus className="h-4 w-4" /> Register Account</KpBtn>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search by name or account number..." className="max-w-md" />
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={a => a.business_account_id} emptyMsg="No business accounts found." />}</KpCard>
    </div>
  );
}
