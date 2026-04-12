'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Circle, ChevronDown, ChevronUp, Clock, BookOpen, Users, ExternalLink, Loader2, FileText, Link2, Save, X } from 'lucide-react';
import { lpFetch, type Roadmap, type TodoProgress } from '@/lib/learnpath/api';
import { LevelBadge, ProgressBar, Card, PrimaryBtn, GhostBtn, SkeletonList } from '@/components/learnpath/ui';

interface EnrollmentData { id: string; progress: TodoProgress[]; googleDocUrl?: string | null; }

export default function LearnerRoadmapDetail() {
  const params = useParams();
  const roadmapId = params?.id as string;

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});
  const [docUrl, setDocUrl] = useState('');
  const [editingDoc, setEditingDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docSaved, setDocSaved] = useState(false);

  const fetchAll = useCallback(async () => {
    const [rmRes, enRes] = await Promise.all([
      lpFetch(`/api/learnpath/roadmaps/${roadmapId}`),
      lpFetch(`/api/learnpath/enrollments/${roadmapId}`),
    ]);
    const rm: Roadmap = await rmRes.json();
    const en: EnrollmentData | null = await enRes.json();
    setRoadmap(rm);
    setEnrollment(en?.id ? en : null);
    setDocUrl(en?.googleDocUrl ?? '');
    const firstIncomplete = rm.steps.findIndex(s =>
      s.todos.some(t => !en?.progress.find(p => p.todoId === t.id && p.completed))
    );
    setOpenSteps({ [firstIncomplete === -1 ? 0 : firstIncomplete]: true });
    setLoading(false);
  }, [roadmapId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleTodo = async (todoId: string) => {
    setToggling(todoId);
    await lpFetch(`/api/learnpath/enrollments/${roadmapId}/todos/${todoId}`, { method: 'PATCH' });
    await fetchAll();
    setToggling(null);
  };

  const saveDocUrl = async () => {
    setSavingDoc(true);
    await lpFetch(`/api/learnpath/enrollments/${roadmapId}`, {
      method: 'PATCH', body: JSON.stringify({ googleDocUrl: docUrl.trim() || null }),
    });
    setEnrollment(e => e ? { ...e, googleDocUrl: docUrl.trim() || null } : e);
    setSavingDoc(false); setEditingDoc(false); setDocSaved(true);
    setTimeout(() => setDocSaved(false), 2500);
  };

  if (loading || !roadmap) {
    return <div className="max-w-2xl mx-auto"><SkeletonList rows={4} height="h-20" /></div>;
  }

  const allTodos = roadmap.steps.flatMap(s => s.todos);
  const completedCount = enrollment?.progress.filter(p => p.completed).length ?? 0;
  const totalCount = allTodos.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalHours = roadmap.steps.reduce((acc, s) => acc + s.estimatedHours, 0);
  const isTodoDone = (todoId: string) => !!enrollment?.progress.find(p => p.todoId === todoId && p.completed);
  const isStepDone = (step: Roadmap['steps'][0]) => step.todos.every(t => isTodoDone(t.id));
  const savedDoc = enrollment?.googleDocUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link href="/learnpath/learner"
        className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity theme-text-subtle">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      {/* Hero card */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 theme-neon-gradient" />
        <div className="flex flex-wrap gap-1.5 mb-3">
          <LevelBadge level={roadmap.level} />
          <span className="text-xs px-2 py-0.5 rounded-full border theme-text-subtle theme-border">{roadmap.category}</span>
        </div>
        <h1 className="text-xl font-bold mb-2 theme-text">{roadmap.title}</h1>
        <p className="text-sm mb-4 theme-text-muted">{roadmap.description}</p>
        <div className="flex flex-wrap gap-4 mb-4 text-xs theme-text-subtle">
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{roadmap.steps.length} steps</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{totalHours}h estimated</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{roadmap._count?.enrollments ?? 0} enrolled</span>
        </div>
        <ProgressBar pct={progressPct} label={`${completedCount}/${totalCount} tasks`} />
        {progressPct === 100 && (
          <p className="flex items-center gap-1.5 mt-2 text-sm font-semibold theme-text-success">
            <CheckCircle className="h-4 w-4" /> Roadmap Complete! 🎉
          </p>
        )}
      </Card>

      {/* Google Doc */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg p-2 theme-tag-info">
            <FileText className="h-5 w-5 theme-text-info" />
          </div>
          <div>
            <p className="font-semibold text-sm theme-text">Google Doc</p>
            <p className="text-xs theme-text-subtle">Attach your personal study notes document</p>
          </div>
        </div>
        {savedDoc && !editingDoc ? (
          <div className="flex items-center gap-2 flex-wrap">
            <a href={savedDoc} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity theme-tag-info">
              <ExternalLink className="h-3.5 w-3.5" /> Open in Google Docs
            </a>
            <GhostBtn onClick={() => { setDocUrl(savedDoc); setEditingDoc(true); }} className="text-xs py-1.5 px-3">
              <Link2 className="h-3.5 w-3.5" /> Change URL
            </GhostBtn>
            <button onClick={() => { setDocUrl(''); saveDocUrl(); }}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-red-500/10 transition-colors theme-text-danger border-red-500/20">
              <X className="h-3.5 w-3.5 inline mr-1" /> Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="url" value={docUrl} onChange={e => setDocUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border theme-select theme-border" />
            <div className="flex gap-2">
              <PrimaryBtn onClick={saveDocUrl} loading={savingDoc} className="text-sm py-1.5 px-3">
                <Save className="h-3.5 w-3.5" />{savingDoc ? 'Saving…' : 'Save Link'}
              </PrimaryBtn>
              {editingDoc && <GhostBtn onClick={() => setEditingDoc(false)} className="text-sm py-1.5 px-3">Cancel</GhostBtn>}
            </div>
            {docSaved && <p className="text-xs theme-text-success">Google Doc URL saved!</p>}
          </div>
        )}
      </Card>

      {/* Steps accordion */}
      <div className="space-y-3">
        {roadmap.steps.map((step, si) => {
          const done = isStepDone(step);
          const stepCompleted = step.todos.filter(t => isTodoDone(t.id)).length;
          return (
            <div key={step.id} className={`theme-card-bg rounded-xl border overflow-hidden transition-colors ${done ? 'border-green-500/30' : 'theme-border'}`}>
              {/* Step trigger */}
              <button type="button"
                onClick={() => setOpenSteps(p => ({ ...p, [si]: !p[si] }))}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border-1.5 ${done ? 'theme-tag-success border-green-500/40' : 'theme-footer-bg theme-border'}`}>
                  {done
                    ? <CheckCircle className="h-4 w-4 theme-text-success" />
                    : <span className="text-xs font-bold theme-text-subtle">{si + 1}</span>}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-semibold truncate ${done ? 'theme-text-success' : 'theme-text'}`}>{step.title}</p>
                  <p className="text-xs theme-text-subtle">{stepCompleted}/{step.todos.length} completed · {step.estimatedHours}h</p>
                </div>
                {openSteps[si]
                  ? <ChevronUp className="h-4 w-4 flex-shrink-0 theme-text-subtle" />
                  : <ChevronDown className="h-4 w-4 flex-shrink-0 theme-text-subtle" />}
              </button>

              {/* Step body */}
              {openSteps[si] && (
                <div className="border-t px-4 py-4 space-y-4 theme-border">
                  {step.description && <p className="text-sm theme-text-muted">{step.description}</p>}
                  {step.resources.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2 theme-text-subtle">Resources</p>
                      <div className="space-y-1">
                        {step.resources.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity truncate theme-text-accent">
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Todos */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2 theme-text-subtle">Tasks</p>
                    <div className="space-y-2">
                      {step.todos.map(todo => {
                        const isDone = isTodoDone(todo.id);
                        const isToggling = toggling === todo.id;
                        return (
                          <button key={todo.id} onClick={() => toggleTodo(todo.id)} disabled={isToggling}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${isDone ? 'bg-green-500/5 border-green-500/25' : 'theme-footer-bg theme-border'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'border-green-500 bg-green-500' : 'theme-border transparent'}`}>
                              {isToggling
                                ? <Loader2 className={`h-3 w-3 animate-spin ${isDone ? 'text-white' : 'theme-text-subtle'}`} />
                                : isDone
                                  ? <CheckCircle className="h-3 w-3 text-white" />
                                  : <Circle className="h-3 w-3 opacity-0" />}
                            </div>
                            <span className={`text-sm transition-all ${isDone ? 'theme-text-subtle line-through' : 'theme-text'}`}>
                              {todo.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
