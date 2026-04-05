'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, Users, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { lpFetch, type Roadmap } from '@/lib/learnpath/api';

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  BEGINNER: { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
  ADVANCED: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
};

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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Learning Catalog</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--old-price)' }}>Explore and enroll in roadmaps curated for your growth.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--circle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roadmaps..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border"
            style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={levelFilter === l ? { background: 'rgba(0,233,191,0.1)', borderColor: 'rgba(0,233,191,0.4)', color: 'var(--neon-green)' } : { background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
              {l === '' ? 'All Levels' : l.charAt(0) + l.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-xl animate-pulse" style={{ background: 'var(--croma-wall)' }} />)}
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--circle)' }} />
          <p style={{ color: 'var(--old-price)' }}>No roadmaps found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map(r => {
            const enrollment = enrollments[r.id];
            const isEnrolled = !!enrollment;
            const progress = enrollment ? Math.round((enrollment.completed / enrollment.total) * 100) || 0 : 0;
            const ls = LEVEL_STYLES[r.level] ?? LEVEL_STYLES.BEGINNER;
            return (
              <div key={r.id} className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: ls.bg, color: ls.color }}>{r.level}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-color)', color: 'var(--circle)' }}>{r.category}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-color)' }}>{r.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--old-price)' }}>{r.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--circle)' }}>
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{r.steps.length} steps</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{totalHours(r)}h</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r._count?.enrollments ?? 0}</span>
                </div>
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--foot-color)', color: 'var(--circle)' }}>{tag}</span>)}
                  </div>
                )}
                {isEnrolled && (
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--old-price)' }}>
                      <span>Progress</span><span style={{ color: 'var(--neon-green)' }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--foot-color)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--neon-green)' }} />
                    </div>
                  </div>
                )}
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
