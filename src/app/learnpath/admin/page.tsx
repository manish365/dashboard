'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CheckCircle, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';

export default function LearnPathAdminDashboard() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lpFetch('/api/learnpath/roadmaps').then(r => r.json()).then(setRoadmaps).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = roadmaps.length;
  const published = roadmaps.filter(r => r.published).length;
  const totalEnrollments = roadmaps.reduce((s, r) => s + (r._count?.enrollments ?? 0), 0);
  const draft = total - published;

  const stats = [
    { label: 'Total Roadmaps', value: total, icon: BookOpen, color: '#818cf8' },
    { label: 'Published', value: published, icon: CheckCircle, color: '#34d399' },
    { label: 'Total Enrollments', value: totalEnrollments, icon: Users, color: '#a78bfa' },
    { label: 'Draft', value: draft, icon: TrendingUp, color: '#fbbf24' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>LearnPath Admin</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>Manage learning roadmaps and track learner progress.</p>
        </div>
        <Link href="/learnpath/admin/roadmaps/new">
          <button className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
            <Plus className="h-4 w-4" /> New Roadmap
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-5 transition-all"
            style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
            <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}20` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{loading ? '—' : value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--old-price)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-color)' }}>Recent Roadmaps</span>
          <Link href="/learnpath/admin/roadmaps" className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: 'var(--neon-green)' }}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--foot-color)' }} />)}</div>
        ) : roadmaps.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} />
            <p className="text-sm" style={{ color: 'var(--old-price)' }}>No roadmaps yet.</p>
            <Link href="/learnpath/admin/roadmaps/new" className="text-sm hover:opacity-80" style={{ color: 'var(--neon-green)' }}>Create your first roadmap →</Link>
          </div>
        ) : (
          roadmaps.slice(0, 5).map((r, idx) => (
            <div key={r.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
              style={{ borderBottom: idx < Math.min(roadmaps.length, 5) - 1 ? `1px solid var(--border-color)` : 'none' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-lg p-2 flex-shrink-0" style={{ background: 'var(--foot-color)' }}>
                  <BookOpen className="h-4 w-4" style={{ color: 'var(--circle)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{r.title}</p>
                  <p className="text-xs" style={{ color: 'var(--old-price)' }}>{r.steps.length} steps · {r._count?.enrollments ?? 0} enrolled</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full" style={r.published ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' } : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                  {r.published ? 'Published' : 'Draft'}
                </span>
                <Link href={`/learnpath/admin/roadmaps/${r.id}`} className="text-xs hover:opacity-80" style={{ color: 'var(--circle)' }}>Edit →</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
