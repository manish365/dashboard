'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Edit2, Trash2, Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';
import {
  PageHeader, Card, LevelBadge, PublishedBadge,
  SearchInput, DataTable, EmptyState, SkeletonList, DangerBtn,
} from '@/components/learnpath/ui';

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);
    lpFetch(`/api/learnpath/roadmaps${search ? `?search=${search}` : ''}`)
      .then(r => r.json()).then(setRoadmaps).catch(() => setRoadmaps([])).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

  const togglePublish = async (id: string) => {
    await lpFetch(`/api/learnpath/roadmaps/${id}/publish`, { method: 'PATCH' });
    fetchRoadmaps();
  };

  const deleteRoadmap = async (id: string) => {
    if (!confirm('Delete this roadmap?')) return;
    setDeleting(id);
    await lpFetch(`/api/learnpath/roadmaps/${id}`, { method: 'DELETE' });
    fetchRoadmaps();
    setDeleting(null);
  };

  const columns = [
    {
      key: 'title', label: 'Roadmap', render: (r: Roadmap) => (
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{r.title}</p>
          <p className="text-xs" style={{ color: 'var(--old-price)' }}>{r.category}</p>
        </div>
      ),
    },
    { key: 'level', label: 'Level', render: (r: Roadmap) => <LevelBadge level={r.level} /> },
    { key: 'steps', label: 'Steps', render: (r: Roadmap) => <span className="text-sm" style={{ color: 'var(--old-price)' }}>{r.steps.length}</span> },
    {
      key: 'enrolled', label: 'Enrolled', render: (r: Roadmap) => (
        <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--old-price)' }}>
          <Users className="h-3.5 w-3.5" />{r._count?.enrollments ?? 0}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (r: Roadmap) => <PublishedBadge published={r.published} /> },
    {
      key: 'actions', label: 'Actions', align: 'right' as const, render: (r: Roadmap) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => togglePublish(r.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--circle)' }} title={r.published ? 'Unpublish' : 'Publish'}>
            {r.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <Link href={`/learnpath/admin/roadmaps/${r.id}`} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}>
            <Edit2 className="h-4 w-4" />
          </Link>
          <DangerBtn onClick={() => deleteRoadmap(r.id)} loading={deleting === r.id}>
            <Trash2 className="h-4 w-4" />
          </DangerBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmaps"
        subtitle="Create and manage learning roadmaps."
        action={
          <Link href="/learnpath/admin/roadmaps/new">
            <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
              <Plus className="h-4 w-4" /> New Roadmap
            </button>
          </Link>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Search roadmaps..." className="max-w-md" />

      <Card>
        {loading ? (
          <SkeletonList rows={5} />
        ) : roadmaps.length === 0 ? (
          <EmptyState icon={BookOpen} title="No roadmaps found."
            action={<Link href="/learnpath/admin/roadmaps/new" className="text-sm" style={{ color: 'var(--neon-green)' }}>Create your first roadmap →</Link>}
          />
        ) : (
          <DataTable columns={columns} rows={roadmaps} rowKey={r => r.id} />
        )}
      </Card>
    </div>
  );
}
