'use client';
import { useState, useEffect } from 'react';
import { Video, Lightbulb, FileText, Image, Mic, Play } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:8001';

type Scene = { scene_number: number; narration: string; visual_description: string; duration: number; image_url?: string; audio_url?: string; };
type Project = { id: number; title: string; niche: string; status: string; };

function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="theme-text-muted block text-xs font-medium">{label}</label>
      <input className="theme-input-field theme-border w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors" {...props} />
    </div>
  );
}

function IdeasSection({ onSelectTitle }: { onSelectTitle: (t: string) => void }) {
  const [niche, setNiche] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ideas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche }) });
      if (res.ok) { const data = await res.json(); setIdeas(data.ideas); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="theme-card-bg rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="theme-text-neon h-5 w-5" />
        <h2 className="theme-text font-semibold">Generate Video Ideas</h2>
      </div>
      <div className="flex gap-2">
        <input value={niche} onChange={(e) => setNiche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="Enter your niche (e.g. Space Facts)..."
          className="theme-input-field theme-border flex-1 rounded-lg px-3 py-2 text-sm outline-none border" />
        <button onClick={generate} disabled={loading || !niche}
          className="theme-btn-neon rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40">
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {ideas.length > 0 && (
        <div className="space-y-2">
          <p className="theme-text-subtle text-xs font-semibold uppercase tracking-wide">Suggested Titles — click to use</p>
          {ideas.map((idea, i) => (
            <button key={i} onClick={() => onSelectTitle(idea)}
              className="theme-text-muted theme-border w-full text-left text-sm p-3 rounded-lg border transition-all hover:border-[var(--neon-green)] hover:bg-white/5">
              {idea}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScriptSection({ initialTitle }: { initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scriptContent, setScriptContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoGenerating, setVideoGenerating] = useState(false);

  useEffect(() => { if (initialTitle) setTitle(initialTitle); }, [initialTitle]);

  const generateScript = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/scripts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, tone: 'viral' }) });
      if (res.ok) { const data = await res.json(); setScenes(data.scenes); setScriptContent(data.script_content); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateScene = (i: number, field: keyof Scene, value: string | number) => {
    setScenes((prev) => { const s = [...prev]; s[i] = { ...s[i], [field]: value }; return s; });
  };

  const generateMedia = async (i: number, type: 'image' | 'voice') => {
    const scene = scenes[i];
    try {
      const endpoint = type === 'image' ? '/api/v1/images' : '/api/v1/voice';
      const body = type === 'image' ? { prompt: scene.visual_description } : { text: scene.narration };
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const data = await res.json(); updateScene(i, type === 'image' ? 'image_url' : 'audio_url', data.url); }
    } catch (e) { console.error(e); }
  };

  const generateVideo = async () => {
    setVideoGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/video`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_title: title, scenes: scenes.map((s) => ({ image_url: s.image_url || '', audio_url: s.audio_url || '', duration: s.duration })) }),
      });
      if (res.ok) { const data = await res.json(); setVideoUrl(data.video_url); }
    } catch (e) { console.error(e); } finally { setVideoGenerating(false); }
  };

  return (
    <div className="theme-card-bg rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="theme-text-neon h-5 w-5" />
        <h2 className="theme-text font-semibold">Script & Scene Builder</h2>
      </div>
      <div className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Selected Title..."
          className="theme-input-field theme-border flex-1 rounded-lg px-3 py-2 text-sm outline-none border" />
        <button onClick={generateScript} disabled={loading || !title}
          className="theme-btn-cancel rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 border">
          {loading ? 'Writing...' : 'Generate Script'}
        </button>
      </div>

      {scriptContent && (
        <div className="theme-footer-bg theme-text-muted p-4 rounded-lg text-sm">
          <strong className="theme-text">Hook:</strong> {scriptContent}
        </div>
      )}

      {scenes.length > 0 && (
        <div className="space-y-4">
          <p className="theme-text-subtle text-xs font-semibold uppercase tracking-wide">Scene Editor</p>
          {scenes.map((scene, idx) => (
            /* borderLeft neon accent is intentional design — kept as style */
            <div key={idx} className="theme-footer-bg theme-border rounded-xl border p-4 space-y-3" style={{ borderLeft: '4px solid var(--neon-green)' }}>
              <div className="flex items-center justify-between">
                <h4 className="theme-text font-semibold text-sm">Scene {scene.scene_number}</h4>
                <span className="theme-text-subtle text-xs">{scene.duration}s</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="theme-text-muted text-xs">Narration (Voiceover)</label>
                  <button onClick={() => generateMedia(idx, 'voice')} className="theme-text-link flex items-center gap-1 text-xs hover:opacity-80">
                    <Mic className="h-3 w-3" /> Generate Voice
                  </button>
                </div>
                <textarea rows={2} value={scene.narration} onChange={(e) => updateScene(idx, 'narration', e.target.value)}
                  className="theme-card-bg theme-border w-full rounded-lg p-2 text-sm outline-none border resize-none" />
                {scene.audio_url && <audio controls src={scene.audio_url} className="h-8 w-full mt-1" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="theme-text-muted text-xs">Visual Prompt (Image Gen)</label>
                  <button onClick={() => generateMedia(idx, 'image')} className="theme-text-link flex items-center gap-1 text-xs hover:opacity-80">
                    <Image className="h-3 w-3" /> Generate Image
                  </button>
                </div>
                <textarea rows={2} value={scene.visual_description} onChange={(e) => updateScene(idx, 'visual_description', e.target.value)}
                  className="theme-card-bg theme-border w-full rounded-lg p-2 text-sm outline-none border resize-none" />
                {scene.image_url && <img src={scene.image_url} alt="Scene" className="h-24 object-cover mt-1 rounded-lg" />}
              </div>
            </div>
          ))}

          <button onClick={generateVideo} disabled={videoGenerating}
            className="theme-btn-neon w-full flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-all hover:opacity-90 disabled:opacity-40">
            <Play className="h-5 w-5" /> {videoGenerating ? 'Rendering Video...' : 'Generate Final Video'}
          </button>

          {videoUrl && (
            <div className="theme-footer-bg theme-border flex flex-col items-center gap-4 rounded-xl border p-6">
              <h3 className="theme-text-neon font-bold text-xl">Video Rendered Successfully!</h3>
              <video src={videoUrl} controls className="w-full max-w-md rounded-lg shadow-lg" />
              <a href={videoUrl} download className="theme-text-link text-sm hover:opacity-80">Download MP4</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/projects/`).then((r) => r.ok ? r.json() : []).then(setProjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="theme-text-muted text-sm">Loading projects...</div>;
  if (projects.length === 0) return null;

  return (
    <div className="theme-card-bg rounded-xl border p-6 space-y-4">
      <h2 className="theme-text font-semibold">Your Video Projects</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <div key={proj.id} className="theme-footer-bg theme-border rounded-xl border p-4 space-y-2 transition-all hover:border-[var(--neon-green)]/30">
            <p className="theme-text font-medium text-sm line-clamp-2">{proj.title}</p>
            <p className="theme-text-muted text-xs">{proj.niche}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${proj.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'}`}>{proj.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VideoCreatorPage() {
  const [selectedTitle, setSelectedTitle] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="theme-neon-bg-subtle rounded-xl p-2.5">
          <Video className="theme-text-neon h-6 w-6" />
        </div>
        <div>
          <h1 className="theme-text text-2xl font-bold">AI Video Creator</h1>
          <p className="theme-text-muted text-sm">Generate complete viral videos — ideas, scripts, voices, and rendering all in one place</p>
        </div>
      </div>
      <ProjectsSection />
      <IdeasSection onSelectTitle={setSelectedTitle} />
      <ScriptSection initialTitle={selectedTitle} />
    </div>
  );
}
