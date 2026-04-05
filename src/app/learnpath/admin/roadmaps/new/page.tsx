'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Eye, Loader2, ArrowLeft, BookOpen, Tag, Layers, Clock, Link2, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { lpFetch } from '@/lib/learnpath/api';

interface TodoDraft { label: string; }
interface StepDraft { title: string; description: string; resources: string; estimatedHours: number; todos: TodoDraft[]; open: boolean; }
const emptyStep = (): StepDraft => ({ title: '', description: '', resources: '', estimatedHours: 2, todos: [{ label: '' }], open: true });
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const CATEGORIES = ['Engineering', 'Design', 'DevOps', 'Data Science', 'Leadership', 'Product', 'Security', 'Other'];
const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BEGINNER: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  ADVANCED: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>{label}</label>
      <input className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} {...props} />
    </div>
  );
}

export default function RoadmapFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id && params.id !== 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([emptyStep()]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    lpFetch(`/api/learnpath/roadmaps/${params.id}`).then(r => r.json()).then(data => {
      setTitle(data.title); setDescription(data.description); setCategory(data.category);
      setLevel(data.level); setTags(data.tags.join(', '));
      setSteps(data.steps.map((s: any) => ({ title: s.title, description: s.description, resources: s.resources.join('\n'), estimatedHours: s.estimatedHours, todos: s.todos.map((t: any) => ({ label: t.label })), open: false })));
      setLoading(false);
    });
  }, [isEdit, params?.id]);

  const addStep = () => setSteps(p => [...p, emptyStep()]);
  const removeStep = (i: number) => setSteps(p => p.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof StepDraft, val: unknown) => setSteps(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addTodo = (si: number) => setSteps(p => p.map((s, i) => i === si ? { ...s, todos: [...s.todos, { label: '' }] } : s));
  const removeTodo = (si: number, ti: number) => setSteps(p => p.map((s, i) => i === si ? { ...s, todos: s.todos.filter((_, j) => j !== ti) } : s));
  const updateTodo = (si: number, ti: number, val: string) => setSteps(p => p.map((s, i) => i === si ? { ...s, todos: s.todos.map((t, j) => j === ti ? { label: val } : t) } : s));

  const handleSave = async (publish = false) => {
    setError('');
    if (!title.trim()) { setError('Roadmap title is required.'); return; }
    if (steps.some(s => !s.title.trim())) { setError('All steps must have a title.'); return; }
    if (publish) setPublishing(true); else setSaving(true);
    const payload = { title, description, category, level, tags: tags.split(',').map(t => t.trim()).filter(Boolean), steps: steps.map(s => ({ title: s.title, description: s.description, resources: s.resources.split('\n').map(r => r.trim()).filter(Boolean), estimatedHours: s.estimatedHours, todos: s.todos.filter(t => t.label.trim()) })) };
    const url = isEdit ? `/api/learnpath/roadmaps/${params.id}` : '/api/learnpath/roadmaps';
    const res = await lpFetch(url, { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    if (!res.ok) { setError('Failed to save.'); setSaving(false); setPublishing(false); return; }
    const data = await res.json();
    if (publish) await lpFetch(`/api/learnpath/roadmaps/${isEdit ? params.id : data.id}/publish`, { method: 'PATCH' });
    router.push('/learnpath/admin/roadmaps');
  };

  const lc = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--foot-color)' }} />)}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/learnpath/admin/roadmaps" className="rounded-xl p-2 border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--circle)' }}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{isEdit ? 'Edit Roadmap' : 'Create Roadmap'}</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>{isEdit ? 'Update details, steps, and todos.' : 'Define the title, steps, and todo tasks.'}</p>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>}

      {/* Details */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <BookOpen className="h-4 w-4" style={{ color: 'var(--neon-green)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Roadmap Details</span>
        </div>
        <div className="p-5 space-y-4">
          <FieldInput label="Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Full-Stack Web Development" />
          <div className="space-y-1">
            <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what learners will achieve..."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border resize-none"
              style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)', fontFamily: 'inherit' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--navbar-carousel-color)' }}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Level</label>
              <div className="flex gap-2">
                {LEVELS.map(l => {
                  const lclr = LEVEL_COLORS[l];
                  return (
                    <button key={l} type="button" onClick={() => setLevel(l)} className="flex-1 rounded-lg py-2.5 text-xs font-bold transition-all border"
                      style={{ background: level === l ? lclr.bg : 'var(--foot-color)', color: level === l ? lclr.color : 'var(--circle)', borderColor: level === l ? lclr.border : 'var(--border-color)' }}>
                      {l.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <FieldInput label="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          {tags.trim() && (
            <div className="flex flex-wrap gap-1.5">
              {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,233,191,0.1)', color: 'var(--neon-green)' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Steps & Todos <span className="text-xs font-normal" style={{ color: 'var(--circle)' }}>{steps.length} step{steps.length !== 1 ? 's' : ''}</span></span>
          <button type="button" onClick={addStep} className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
            <Plus className="h-3.5 w-3.5" /> Add Step
          </button>
        </div>

        {steps.map((step, si) => (
          <div key={si} className="rounded-xl border overflow-hidden" style={{ background: 'var(--croma-wall)', borderColor: step.open ? 'rgba(0,233,191,0.2)' : 'var(--border-color)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: step.open ? 'rgba(0,233,191,0.1)' : 'var(--foot-color)', color: step.open ? 'var(--neon-green)' : 'var(--circle)', border: `1px solid ${step.open ? 'rgba(0,233,191,0.3)' : 'var(--border-color)'}` }}>
                {si + 1}
              </div>
              {step.open ? (
                <input value={step.title} onChange={e => updateStep(si, 'title', e.target.value)} placeholder={`Step ${si + 1} title…`} onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent border-b text-sm font-semibold outline-none pb-0.5"
                  style={{ borderColor: 'rgba(0,233,191,0.3)', color: 'var(--text-color)' }} />
              ) : (
                <span className="flex-1 text-sm font-semibold truncate" style={{ color: step.title ? 'var(--text-color)' : 'var(--circle)' }}>{step.title || `Step ${si + 1} — (untitled)`}</span>
              )}
              <div className="flex items-center gap-1 flex-shrink-0">
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(si)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'var(--circle)' }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => updateStep(si, 'open', !step.open)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--circle)' }}>
                  {step.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {step.open && (
              <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Description</label>
                  <textarea rows={2} value={step.description} onChange={e => updateStep(si, 'description', e.target.value)} placeholder="What will learners accomplish?"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border resize-none"
                    style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)', fontFamily: 'inherit' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Est. Hours" type="number" min="0.5" step="0.5" value={step.estimatedHours} onChange={e => updateStep(si, 'estimatedHours', parseFloat(e.target.value))} />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold" style={{ color: 'var(--old-price)' }}>Resources (one URL per line)</label>
                    <textarea rows={2} value={step.resources} onChange={e => updateStep(si, 'resources', e.target.value)} placeholder="https://docs.example.com"
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none border resize-none"
                      style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--circle)' }}>Todo Tasks</label>
                    <button type="button" onClick={() => addTodo(si)} className="text-xs hover:opacity-80" style={{ color: 'var(--neon-green)' }}>+ Add task</button>
                  </div>
                  <div className="space-y-2">
                    {step.todos.map((todo, ti) => (
                      <div key={ti} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'var(--border-color)' }} />
                        <input value={todo.label} onChange={e => updateTodo(si, ti, e.target.value)} placeholder={`Task ${ti + 1}…`}
                          className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none border"
                          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
                        {step.todos.length > 1 && (
                          <button type="button" onClick={() => removeTodo(si, ti)} className="p-1 rounded hover:bg-red-500/10 flex-shrink-0" style={{ color: 'var(--circle)' }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button type="button" onClick={addStep} className="w-full rounded-xl py-3 text-sm font-semibold border-2 border-dashed transition-all hover:bg-white/5"
          style={{ borderColor: 'rgba(0,233,191,0.2)', color: 'var(--circle)' }}>
          <Plus className="h-4 w-4 inline mr-1" /> Add Another Step
        </button>
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border px-5 py-4"
        style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)', backdropFilter: 'blur(12px)' }}>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>{level}</span>
        <div className="flex gap-2">
          <Link href="/learnpath/admin/roadmaps" className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>Cancel</Link>
          <button onClick={() => handleSave(false)} disabled={saving || publishing} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border hover:bg-white/5 transition-colors disabled:opacity-40"
            style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving || publishing} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
