'use client';
import { useState, useEffect } from 'react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpField, KpSkeleton, KpPagination } from '@/components/kestopur/ui';

interface Log { id: string; action: string; resource: string; actorId: string; createdAt: string; status?: string; }

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState('');
  const [actorId, setActorId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(resource && { resource }), ...(actorId && { actorId }) });
    const r = await kpFetch(`/wp-admin/audit-logs?${params}`);
    setLogs(Array.isArray(r.data) ? r.data : r.data?.data || []);
    setTotalPages(r.data?.totalPages || 1);
    setLoading(false);
  };
  useEffect(() => { fetchLogs(); }, [page, resource, actorId]);

  const cols = [
    { key: 'action',   label: 'Action',   render: (l: Log) => <span className="theme-text text-sm font-medium">{l.action}</span> },
    { key: 'resource', label: 'Resource', render: (l: Log) => <span className="theme-text-muted text-sm">{l.resource}</span> },
    { key: 'actor',    label: 'Actor',    render: (l: Log) => <span className="theme-text-subtle text-xs font-mono">{l.actorId?.slice(0, 8)}...</span> },
    { key: 'date',     label: 'Date',     render: (l: Log) => <span className="theme-text-subtle text-sm">{new Date(l.createdAt).toLocaleString()}</span> },
    { key: 'status',   label: 'Status',   render: (l: Log) => <KpBadge label={l.status || 'success'} variant={l.status || 'active'} /> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Audit Logs" subtitle="Track all system actions and changes" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg">
        <KpField label="Resource" value={resource} onChange={e => setResource(e.target.value)} placeholder="e.g. User, Role" />
        <KpField label="Actor ID" value={actorId} onChange={e => setActorId(e.target.value)} placeholder="UUID" />
      </div>
      <KpCard>
        {loading ? <KpSkeleton /> : <KpTable cols={cols} rows={logs} rowKey={l => l.id} emptyMsg="No audit logs found." />}
        <KpPagination page={page} totalPages={totalPages} total={logs.length} limit={20} onPage={setPage} />
      </KpCard>
    </div>
  );
}
