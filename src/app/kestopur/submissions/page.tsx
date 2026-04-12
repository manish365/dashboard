'use client';
import { useState, useEffect } from 'react';
import { Eye, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { useToast } from '@/providers/toast-context';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpBtn, KpSearch, KpSkeleton, KpPagination, KpModal } from '@/components/kestopur/ui';

interface Submission {
  submission_id: string;
  submission_code: string;
  submission_type: string;
  seller_id: string;
  status: string;
  created_at: string;
  data?: any;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const { showToast } = useToast();

  const fetchSubmissions = async () => {
    setLoading(true);
    const r = await kpFetch('/submissions');
    if (r.success) {
      setSubmissions(Array.isArray(r.data) ? r.data : []);
    } else {
      showToast(r.error || 'Failed to load submissions', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = submissions.filter(sub => {
    const matchesSearch =
      sub.submission_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.submission_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cols = [
    {
      key: 'code',
      label: 'Code / Type',
      render: (sub: Submission) => (
        <div>
          <p className="text-sm font-semibold uppercase theme-text">{sub.submission_code || 'N/A'}</p>
          <p className="text-xs capitalize theme-text-muted">{sub.submission_type}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      label: 'Seller ID',
      render: (sub: Submission) => <span className="text-xs font-mono theme-text-subtle">{sub.seller_id}</span>,
    },
    {
      key: 'date',
      label: 'Submitted',
      render: (sub: Submission) => <span className="text-sm theme-text-muted">{new Date(sub.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (sub: Submission) => <KpBadge label={sub.status.replace('_', ' ')} variant={sub.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (sub: Submission) => (
        <KpBtn onClick={() => setSelected(sub)} className="py-1.5 px-3">
          <Eye className="h-4 w-4" /> Review
        </KpBtn>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Submission Management" subtitle="Review and approve product or category submissions" />

      <div className="flex flex-wrap gap-4">
        <KpSearch value={searchTerm} onChange={setSearchTerm} placeholder="Search code or type..." className="flex-1 max-w-md" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl outline-none border min-w-[150px] theme-select theme-border"
        >
          <option value="all" className="theme-option">All Statuses</option>
          {['submitted', 'under_review', 'approved', 'rejected', 'requires_changes'].map(s => (
            <option key={s} value={s} className="theme-option">{s.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      <KpCard>
        {loading ? (
          <KpSkeleton />
        ) : (
          <KpTable
            cols={cols}
            rows={filtered}
            rowKey={(sub) => sub.submission_id}
            emptyMsg="No submissions found matching your filters."
          />
        )}
      </KpCard>

      {selected && (
        <KpModal title={`Submission Review: ${selected.submission_code}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold theme-text-subtle">Submission ID</p>
                <p className="text-sm font-mono mt-1 theme-text">{selected.submission_id}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold theme-text-subtle">Seller ID</p>
                <p className="text-sm font-mono mt-1 theme-text">{selected.seller_id}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border theme-footer-bg theme-border">
              <p className="text-[10px] uppercase font-bold mb-3 theme-text-subtle">Submission Data (JSON)</p>
              <pre className="text-xs overflow-auto max-h-40 p-2 rounded bg-black/20 theme-text-muted">
                {JSON.stringify(selected.data || {}, null, 2)}
              </pre>
            </div>

            <div className="flex gap-3 pt-2">
              <KpBtn onClick={() => { showToast('Approved (Mock)', 'success'); setSelected(null); }} className="flex-1 justify-center">
                Approve
              </KpBtn>
              <button onClick={() => { showToast('Rejected (Mock)', 'error'); setSelected(null); }}
                className="flex-1 rounded-xl py-2.5 text-sm border hover:bg-red-500/10 transition-colors theme-text-danger theme-border">
                Reject
              </button>
            </div>
          </div>
        </KpModal>
      )}
    </div>
  );
}
