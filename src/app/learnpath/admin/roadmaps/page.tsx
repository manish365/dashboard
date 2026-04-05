'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen, Edit2, Trash2, Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  BEGINNER: { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
  ADVANCED: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
};

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Roadmaps</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>Create and manage learning roadmaps.</p>
        </div>
        <Link href="/learnpath/admin/roadmaps/new">
          <button className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold hover:opacity-90"
            style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
            <Plus className="h-4 w-4" /> New Roadmap
          </button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--circle)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roadmaps..."
          className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--foot-color)' }} />)}</div>
        ) : roadmaps.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} />
            <p className="text-sm mb-2" style={{ color: 'var(--old-price)' }}>No roadmaps found.</p>
            <Link href="/learnpath/admin/roadmaps/new" className="text-sm" style={{ color: 'var(--neon-green)' }}>Create your first roadmap →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border-color)` }}>
                  {['Roadmap', 'Level', 'Steps', 'Enrolled', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--circle)', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roadmaps.map(r => {
                  const lc = LEVEL_COLORS[r.level] ?? LEVEL_COLORS.BEGINNER;
                  return (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: `1px solid var(--border-color)` }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{r.title}</p>
                        <p className="text-xs" style={{ color: 'var(--old-price)' }}>{r.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: lc.bg, color: lc.color }}>{r.level}</span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--old-price)' }}>{r.steps.length}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--old-price)' }}>
                          <Users className="h-3.5 w-3.5" />{r._count?.enrollments ?? 0}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={r.published ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' } : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                          {r.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => togglePublish(r.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }} title={r.published ? 'Unpublish' : 'Publish'}>
                            {r.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <Link href={`/learnpath/admin/roadmaps/${r.id}`} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--circle)' }}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button onClick={() => deleteRoadmap(r.id)} disabled={deleting === r.id} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: deleting === r.id ? 'var(--circle)' : '#f87171' }}>
                            {deleting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
