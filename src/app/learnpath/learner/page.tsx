'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';
import { PageHeader, SearchInput, LevelBadge, EmptyState, ProgressBar } from '@/components/learnpath/ui';

export default function LearnerCatalogPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (levelFilter) params.set('level', levelFilter);
    const res = await lpFetch(`/api/learnpath/roadmaps?${params}`);
    const data: Roadmap[] = await res.json();
    setRoadmaps(data);
    const enrollmentData: Record<string, { completed: number; total: number }> = {};
    await Promise.all(data.map(async r => {
      const er = await lpFetch(`/api/learnpath/enrollments/${r.id}`);
      const enrollment = await er.json();
      if (enrollment && !enrollment.error) {
        const total = r.steps.reduce((acc, s) => acc + s.todos.length, 0);
        const completed = enrollment.progress.filter((p: { completed: boolean }) => p.completed).length;
        enrollmentData[r.id] = { completed, total };
      }
    }));
    setEnrollments(enrollmentData);
    setLoading(false);
  }, [search, levelFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const enroll = async (roadmapId: string) => {
    setEnrolling(roadmapId);
    await lpFetch('/api/learnpath/enrollments', { method: 'POST', body: JSON.stringify({ roadmapId }) });
    await fetchData();
    setEnrolling(null);
  };

  const totalHours = (r: Roadmap) => r.steps.reduce((acc, s) => acc + s.estimatedHours, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Learning Catalog" subtitle="Explore and enroll in roadmaps curated for your growth." />

      {/* Filters */}
      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search roadmaps..." />
        <div className="flex gap-2 flex-wrap">
          {['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={levelFilter === l
                ? { background: 'rgba(0,233,191,0.1)', borderColor: 'rgba(0,233,191,0.4)', color: 'var(--neon-green)' }
                : { background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
              {l === '' ? 'All Levels' : l.charAt(0) + l.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl animate-pulse" style={{ background: 'var(--croma-wall)' }} />
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState icon={BookOpen} title="No roadmaps found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map(r => {
            const enrollment = enrollments[r.id];
            const isEnrolled = !!enrollment;
            const progress = enrollment
              ? Math.round((enrollment.completed / (enrollment.total || 1)) * 100)
              : 0;
            return (
              <div key={r.id}
                className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={r.level} />
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-color)', color: 'var(--circle)' }}>
                    {r.category}
                  </span>
                </div>
                {/* Title */}
                <div>
                  <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-color)' }}>{r.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--old-price)' }}>{r.description}</p>
                </div>
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--circle)' }}>
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{r.steps.length} steps</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{totalHours(r)}h</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r._count?.enrollments ?? 0}</span>
                </div>
                {/* Tags */}
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--foot-color)', color: 'var(--circle)' }}>{tag}</span>
                    ))}
                  </div>
                )}
                {/* Progress */}
                {isEnrolled && <ProgressBar pct={progress} label="Progress" />}
                {/* CTA */}
                <div className="mt-auto">
                  {isEnrolled ? (
                    <Link href={`/learnpath/learner/roadmap/${r.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border transition-all hover:bg-white/5"
                      style={{ borderColor: 'rgba(0,233,191,0.3)', color: 'var(--neon-green)' }}>
                      {progress === 100 ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {progress === 100 ? 'Completed!' : 'Continue Learning'}
                    </Link>
                  ) : (
                    <button onClick={() => enroll(r.id)} disabled={enrolling === r.id}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
                      {enrolling === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
