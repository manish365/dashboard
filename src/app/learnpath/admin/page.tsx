'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CheckCircle, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';
import { PageHeader, StatCard, Card, CardHeader, LevelBadge, PublishedBadge, EmptyState, SkeletonList } from '@/components/learnpath/ui';

export default function LearnPathAdminDashboard() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lpFetch('/api/learnpath/roadmaps')
      .then(r => r.json()).then(setRoadmaps).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = roadmaps.length;
  const published = roadmaps.filter(r => r.published).length;
  const totalEnrollments = roadmaps.reduce((s, r) => s + (r._count?.enrollments ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="LearnPath Admin"
        subtitle="Manage learning roadmaps and track learner progress."
        action={
          <Link href="/learnpath/admin/roadmaps/new">
            <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
              <Plus className="h-4 w-4" /> New Roadmap
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Roadmaps"    value={total}            icon={BookOpen}    color="#818cf8" loading={loading} />
        <StatCard label="Published"         value={published}        icon={CheckCircle} color="#34d399" loading={loading} />
        <StatCard label="Total Enrollments" value={totalEnrollments} icon={Users}       color="#a78bfa" loading={loading} />
        <StatCard label="Draft"             value={total - published} icon={TrendingUp} color="#fbbf24" loading={loading} />
      </div>

      <Card>
        <CardHeader
          title="Recent Roadmaps"
          action={
            <Link href="/learnpath/admin/roadmaps" className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: 'var(--neon-green)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        {loading ? (
          <SkeletonList rows={3} height="h-12" />
        ) : roadmaps.length === 0 ? (
          <EmptyState icon={BookOpen} title="No roadmaps yet."
            action={<Link href="/learnpath/admin/roadmaps/new" className="text-sm hover:opacity-80" style={{ color: 'var(--neon-green)' }}>Create your first roadmap →</Link>}
          />
        ) : (
          roadmaps.slice(0, 5).map((r, idx) => (
            <div key={r.id}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
              style={{ borderBottom: idx < Math.min(roadmaps.length, 5) - 1 ? '1px solid var(--border-color)' : 'none' }}>
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
                <PublishedBadge published={r.published} />
                <Link href={`/learnpath/admin/roadmaps/${r.id}`} className="text-xs hover:opacity-80" style={{ color: 'var(--circle)' }}>Edit →</Link>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
