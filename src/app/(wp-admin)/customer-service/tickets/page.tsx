'use client';
import { useState, useEffect } from 'react';
import { Ticket, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSkeleton } from '@/components/kestopur/ui';

interface SupportTicket { id: string; subject: string; priority: string; status: string; createdAt: string; }

const PRIORITY_CLASSES: Record<string, string> = { high: 'theme-tag-danger', medium: 'theme-tag-warning', low: 'theme-tag-success' };

export default function TicketsPage() {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kpFetch('/customer-service/tickets')
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.subject?.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'subject', label: 'Subject', render: (t: SupportTicket) => <span className="text-sm font-medium theme-text">{t.subject}</span> },
    {
      key: 'priority', label: 'Priority', render: (t: SupportTicket) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_CLASSES[t.priority?.toLowerCase()] || 'theme-tag-subtle'}`}>
          {t.priority}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (t: SupportTicket) => <KpBadge label={t.status} variant={t.status} /> },
    { key: 'date', label: 'Created', render: (t: SupportTicket) => <span className="text-sm theme-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <Link href="/kestopur/customer-service" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 theme-text-subtle">
        <ArrowLeft className="h-4 w-4" /> Customer Service
      </Link>
      <KpPageHeader title="Support Tickets" subtitle="Handle customer support requests"
        action={<div className="rounded-xl p-2.5 theme-tag-purple"><Ticket className="h-5 w-5 theme-text-purple" /></div>} />
      <KpSearch value={search} onChange={setSearch} placeholder="Search tickets..." className="max-w-md" />
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={t => t.id} emptyMsg="No support tickets found." />}
      </KpCard>
    </div>
  );
}
