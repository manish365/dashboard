'use client';
import { useState, useEffect } from 'react';
import { Video, Lightbulb, FileText, Image, Mic, Play, Plus } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:8001';

type Scene = { scene_number: number; narration: string; visual_description: string; duration: number; image_url?: string; audio_url?: string; };
type Project = { id: number; title: string; niche: string; status: string; };

function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium" style={{ color: 'var(--old-price)' }}>{label}</label>
      <input className="w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        {...props} />
    </div>
  );
}

// ── Ideas Section ──────────────────────────────────────────────────────────────
function IdeasSection({ onSelectTitle }: { onSelectTitle: (t: string) => void }) {
  const [niche, setNiche] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ideas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      if (res.ok) { const data = await res.json(); setIdeas(data.ideas); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5" style={{ color: 'var(--neon-green)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--text-color)' }}>Generate Video Ideas</h2>
      </div>
      <div className="flex gap-2">
        <input value={niche} onChange={(e) => setNiche(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="Enter your niche (e.g. Space Facts)..."
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none border"
          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
        <button onClick={generate} disabled={loading || !niche}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--neon-green)', color: '#000' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {ideas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--circle)' }}>Suggested Titles — click to use</p>
          {ideas.map((idea, i) => (
            <button key={i} onClick={() => onSelectTitle(idea)}
              className="w-full text-left text-sm p-3 rounded-lg border transition-all hover:border-[var(--neon-green)] hover:bg-white/5"
              style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
              {idea}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Script Section ─────────────────────────────────────────────────────────────
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
      const res = await fetch(`${API_BASE}/api/v1/scripts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, tone: 'viral' }),
      });
      if (res.ok) { const data = await res.json(); setScenes(data.scenes); setScriptContent(data.script_content); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
    } catch (e) { console.error(e); }
    finally { setVideoGenerating(false); }
  };

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" style={{ color: 'var(--neon-green)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--text-color)' }}>Script & Scene Builder</h2>
      </div>
      <div className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Selected Title (e.g. 10 Scary Facts About Space)..."
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none border"
          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
        <button onClick={generateScript} disabled={loading || !title}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--old-price)', border: '1px solid' }}>
          {loading ? 'Writing...' : 'Generate Script'}
        </button>
      </div>

      {scriptContent && (
        <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--foot-color)', color: 'var(--old-price)' }}>
          <strong style={{ color: 'var(--text-color)' }}>Hook:</strong> {scriptContent}
        </div>
      )}

      {scenes.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--circle)' }}>Scene Editor</p>
          {scenes.map((scene, idx) => (
            <div key={idx} className="rounded-xl border p-4 space-y-3"
              style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', borderLeft: '4px solid var(--neon-green)' }}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Scene {scene.scene_number}</h4>
                <span className="text-xs" style={{ color: 'var(--circle)' }}>{scene.duration}s</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs" style={{ color: 'var(--old-price)' }}>Narration (Voiceover)</label>
                  <button onClick={() => generateMedia(idx, 'voice')} className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: 'var(--hyperlink)' }}>
                    <Mic className="h-3 w-3" /> Generate Voice
                  </button>
                </div>
                <textarea rows={2} value={scene.narration} onChange={(e) => updateScene(idx, 'narration', e.target.value)}
                  className="w-full rounded-lg p-2 text-sm outline-none border resize-none"
                  style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
                {scene.audio_url && <audio controls src={scene.audio_url} className="h-8 w-full mt-1" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs" style={{ color: 'var(--old-price)' }}>Visual Prompt (Image Gen)</label>
                  <button onClick={() => generateMedia(idx, 'image')} className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: 'var(--hyperlink)' }}>
                    <Image className="h-3 w-3" /> Generate Image
                  </button>
                </div>
                <textarea rows={2} value={scene.visual_description} onChange={(e) => updateScene(idx, 'visual_description', e.target.value)}
                  className="w-full rounded-lg p-2 text-sm outline-none border resize-none"
                  style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
                {scene.image_url && <img src={scene.image_url} alt="Scene" className="h-24 object-cover mt-1 rounded-lg" />}
              </div>
            </div>
          ))}

          <button onClick={generateVideo} disabled={videoGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--neon-green)', color: '#000' }}>
            <Play className="h-5 w-5" /> {videoGenerating ? 'Rendering Video...' : 'Generate Final Video'}
          </button>

          {videoUrl && (
            <div className="flex flex-col items-center gap-4 rounded-xl border p-6"
              style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-xl" style={{ color: 'var(--neon-green)' }}>Video Rendered Successfully!</h3>
              <video src={videoUrl} controls className="w-full max-w-md rounded-lg shadow-lg" />
              <a href={videoUrl} download className="text-sm hover:opacity-80" style={{ color: 'var(--hyperlink)' }}>Download MP4</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Projects Section ───────────────────────────────────────────────────────────
function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/projects/`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm" style={{ color: 'var(--old-price)' }}>Loading projects...</div>;
  if (projects.length === 0) return null;

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <h2 className="font-semibold" style={{ color: 'var(--text-color)' }}>Your Video Projects</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <div key={proj.id} className="rounded-xl border p-4 space-y-2 transition-all hover:border-[var(--neon-green)]/30"
            style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}>
            <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-color)' }}>{proj.title}</p>
            <p className="text-xs" style={{ color: 'var(--old-price)' }}>{proj.niche}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${proj.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'}`}>
              {proj.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function VideoCreatorPage() {
  const [selectedTitle, setSelectedTitle] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(0, 233, 191, 0.1)' }}>
          <Video className="h-6 w-6" style={{ color: 'var(--neon-green)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>AI Video Creator</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>Generate complete viral videos — ideas, scripts, voices, and rendering all in one place</p>
        </div>
      </div>

      <ProjectsSection />
      <IdeasSection onSelectTitle={setSelectedTitle} />
      <ScriptSection initialTitle={selectedTitle} />
    </div>
  );
}
