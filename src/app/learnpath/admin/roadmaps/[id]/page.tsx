'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Eye, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { lpFetch } from '@/lib/learnpath/api';
import {
  FieldInput, FieldTextarea, FieldSelect, LevelSelector,
  ErrorAlert, PrimaryBtn, GhostBtn, CATEGORIES, LEVEL_COLORS, SkeletonList,
} from '@/components/learnpath/ui';

interface TodoDraft { label: string; }
interface StepDraft { title: string; description: string; resources: string; estimatedHours: number; todos: TodoDraft[]; open: boolean; }
const emptyStep = (): StepDraft => ({ title: '', description: '', resources: '', estimatedHours: 2, todos: [{ label: '' }], open: true });

export default function RoadmapFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id && params.id !== 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState('BEGINNER');
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
      setSteps(data.steps.map((s: any) => ({
        title: s.title, description: s.description,
        resources: s.resources.join('\n'), estimatedHours: s.estimatedHours,
        todos: s.todos.map((t: any) => ({ label: t.label })), open: false,
      })));
      setLoading(false);
    });
  }, [isEdit, params?.id]);

  const addStep = () => setSteps(p => [...p, emptyStep()]);
  const removeStep = (i: number) => setSteps(p => p.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof StepDraft, val: unknown) =>
    setSteps(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addTodo = (si: number) =>
    setSteps(p => p.map((s, i) => i === si ? { ...s, todos: [...s.todos, { label: '' }] } : s));
  const removeTodo = (si: number, ti: number) =>
    setSteps(p => p.map((s, i) => i === si ? { ...s, todos: s.todos.filter((_, j) => j !== ti) } : s));
  const updateTodo = (si: number, ti: number, val: string) =>
    setSteps(p => p.map((s, i) => i === si ? { ...s, todos: s.todos.map((t, j) => j === ti ? { label: val } : t) } : s));

  const handleSave = async (publish = false) => {
    setError('');
    if (!title.trim()) { setError('Roadmap title is required.'); return; }
    if (steps.some(s => !s.title.trim())) { setError('All steps must have a title.'); return; }
    if (publish) setPublishing(true); else setSaving(true);
    const payload = {
      title, description, category, level,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      steps: steps.map(s => ({
        title: s.title, description: s.description,
        resources: s.resources.split('\n').map(r => r.trim()).filter(Boolean),
        estimatedHours: s.estimatedHours,
        todos: s.todos.filter(t => t.label.trim()),
      })),
    };
    const url = isEdit ? `/api/learnpath/roadmaps/${params.id}` : '/api/learnpath/roadmaps';
    const res = await lpFetch(url, { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    if (!res.ok) { setError('Failed to save.'); setSaving(false); setPublishing(false); return; }
    const data = await res.json();
    if (publish) await lpFetch(`/api/learnpath/roadmaps/${isEdit ? params.id : data.id}/publish`, { method: 'PATCH' });
    router.push('/learnpath/admin/roadmaps');
  };

  const lc = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;

  if (loading) return <SkeletonList rows={4} height="h-16" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/learnpath/admin/roadmaps"
          className="rounded-xl p-2 border hover:bg-white/5 transition-colors theme-text-subtle theme-border">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold theme-text">{isEdit ? 'Edit Roadmap' : 'Create Roadmap'}</h1>
          <p className="text-sm theme-text-muted">{isEdit ? 'Update details, steps, and todos.' : 'Define the title, steps, and todo tasks.'}</p>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Details card */}
      <div className="rounded-xl border overflow-hidden theme-card-bg">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b theme-border">
          <BookOpen className="h-4 w-4 theme-text-neon" />
          <span className="font-semibold text-sm theme-text">Roadmap Details</span>
        </div>
        <div className="p-5 space-y-4">
          <FieldInput label="Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Full-Stack Web Development" />
          <FieldTextarea label="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what learners will achieve..." />
          <div className="grid grid-cols-2 gap-3">
            <FieldSelect label="Category" options={CATEGORIES} value={category} onChange={e => setCategory(e.target.value)} />
            <LevelSelector value={level} onChange={setLevel} />
          </div>
          <FieldInput label="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          {tags.trim() && (
            <div className="flex flex-wrap gap-1.5">
              {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded theme-neon-tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm theme-text">
            Steps & Todos <span className="text-xs font-normal theme-text-subtle">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
          </span>
          <button type="button" onClick={addStep}
            className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 border transition-colors hover:bg-white/5 theme-btn-cancel">
            <Plus className="h-3.5 w-3.5" /> Add Step
          </button>
        </div>

        {steps.map((step, si) => (
          <div key={si} className={`rounded-xl border overflow-hidden theme-card-bg ${step.open ? 'theme-border-brand shadow-sm' : 'theme-border'}`}>
            {/* Step header */}
            <div className="flex items-center gap-3 px-4 py-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border ${step.open ? 'theme-tag-brand theme-border-brand/30' : 'theme-footer-bg theme-text-subtle theme-border'}`}>
                {si + 1}
              </div>
              {step.open ? (
                <input value={step.title} onChange={e => updateStep(si, 'title', e.target.value)}
                  placeholder={`Step ${si + 1} title…`} onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent border-b theme-border-brand/30 text-sm font-semibold outline-none pb-0.5 theme-text" />
              ) : (
                <span className={`flex-1 text-sm font-semibold truncate ${step.title ? 'theme-text' : 'theme-text-subtle'}`}>
                  {step.title || `Step ${si + 1} — (untitled)`}
                </span>
              )}
              <div className="flex items-center gap-1 flex-shrink-0">
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(si)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors theme-text-subtle">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => updateStep(si, 'open', !step.open)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors theme-text-subtle">
                  {step.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Step body */}
            {step.open && (
              <div className="border-t px-4 py-4 space-y-4 theme-border">
                <FieldTextarea label="Description" rows={2} value={step.description}
                  onChange={e => updateStep(si, 'description', e.target.value)} placeholder="What will learners accomplish?" />
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Est. Hours" type="number" min="0.5" step="0.5"
                    value={step.estimatedHours} onChange={e => updateStep(si, 'estimatedHours', parseFloat(e.target.value))} />
                  <FieldTextarea label="Resources (one URL per line)" rows={2} mono
                    value={step.resources} onChange={e => updateStep(si, 'resources', e.target.value)}
                    placeholder="https://docs.example.com" />
                </div>
                {/* Todos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide theme-text-subtle">Todo Tasks</label>
                    <button type="button" onClick={() => addTodo(si)} className="text-xs hover:opacity-80 theme-text-neon">+ Add task</button>
                  </div>
                  <div className="space-y-2">
                    {step.todos.map((todo, ti) => (
                      <div key={ti} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 theme-border" />
                        <input value={todo.label} onChange={e => updateTodo(si, ti, e.target.value)}
                          placeholder={`Task ${ti + 1}…`}
                          className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none border theme-select theme-border" />
                        {step.todos.length > 1 && (
                          <button type="button" onClick={() => removeTodo(si, ti)}
                            className="p-1 rounded hover:bg-red-500/10 flex-shrink-0 theme-text-subtle">
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

        <button type="button" onClick={addStep}
          className="w-full rounded-xl py-3 text-sm font-semibold border-2 border-dashed transition-all hover:bg-white/5 theme-text-subtle border-emerald-500/20">
          <Plus className="h-4 w-4 inline mr-1" /> Add Another Step
        </button>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border px-5 py-4 theme-card-bg backdrop-blur-md">
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${lc.tag}`}>{level}</span>
        <div className="flex gap-2">
          <GhostBtn onClick={() => router.push('/learnpath/admin/roadmaps')}>Cancel</GhostBtn>
          <GhostBtn onClick={() => handleSave(false)} disabled={saving || publishing}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </GhostBtn>
          <PrimaryBtn onClick={() => handleSave(true)} loading={publishing} disabled={saving}>
            <Eye className="h-4 w-4" /> Save & Publish
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
