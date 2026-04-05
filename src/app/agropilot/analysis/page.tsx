'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bug, TrendingUp, Leaf, CheckCircle, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';
import agropilotApi from '@/lib/agropilot/api';

type Tab = 'disease' | 'yield' | 'fertilizer';
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'disease', label: 'Disease Detection', icon: Bug },
  { id: 'yield', label: 'Yield Prediction', icon: TrendingUp },
  { id: 'fertilizer', label: 'Fertilizer Advice', icon: Leaf },
];
const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Tomato', 'Chickpea', 'Sunflower', 'Sugarcane'];
const SOIL_OPTIONS = ['Sandy', 'Clay', 'Loam', 'Silt', 'Sandy Loam', 'Clay Loam'];
const DEFAULT_FORM = { crop_type: 'Rice', soil_type: 'Loam', soil_ph: 6.5, nitrogen: 80, phosphorus: 40, potassium: 40, rainfall_mm: 800, temperature_c: 28, humidity_pct: 70, area_hectares: 1, growth_stage: 'vegetative', target_yield: 4000 };

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

function SelectInput({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium" style={{ color: 'var(--old-price)' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none border"
        style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
        {options.map((o) => <option key={o} value={o} style={{ background: 'var(--navbar-carousel-color)' }}>{o}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5 space-y-4 h-full"
      style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      {children}
    </div>
  );
}

function EmptyResult({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-center rounded-xl border-2 border-dashed p-8"
      style={{ borderColor: 'var(--border-color)' }}>
      <div>
        <Icon className="h-10 w-10 mx-auto mb-2 opacity-20" style={{ color: 'var(--circle)' }} />
        <p className="text-sm" style={{ color: 'var(--circle)' }}>{text}</p>
      </div>
    </div>
  );
}

// ── Disease Tab ────────────────────────────────────────────────────────────────
function DiseaseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Rice');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDrag, setIsDrag] = useState(false);

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(''); };
  const clear = () => { setFile(null); setPreview(null); setResult(null); setError(''); };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('crop_type', cropType);
      const { data } = await agropilotApi.post('/api/vision/detect', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch (err: any) { setError(typeof err === 'string' ? err : 'Analysis failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDrag ? 'border-[var(--neon-green)] bg-[rgba(0,233,191,0.05)]' : ''}`}
          style={{ borderColor: isDrag ? 'var(--neon-green)' : 'var(--border-color)' }}
          onClick={() => document.getElementById('disease-file-input')?.click()}>
          <input id="disease-file-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Crop" className="w-full h-48 object-cover rounded-lg" />
              <button onClick={(e) => { e.stopPropagation(); clear(); }}
                className="absolute top-2 right-2 rounded-full p-1 shadow" style={{ background: 'var(--foot-color)' }}>
                <X className="h-4 w-4" style={{ color: 'var(--text-color)' }} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-10 w-10 mx-auto opacity-30" style={{ color: 'var(--circle)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--old-price)' }}>Drag & drop or click to upload</p>
              <p className="text-xs" style={{ color: 'var(--circle)' }}>JPG, PNG, WebP · Max 10MB</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <SelectInput label="Crop Type" options={CROP_OPTIONS} value={cropType} onChange={setCropType} />
          </div>
          <div className="flex items-end">
            <button onClick={analyze} disabled={!file || loading}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--neon-green)', color: '#000' }}>
              <Bug className="h-4 w-4" /> {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
        {error && <p className="text-sm rounded-lg p-2" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>{error}</p>}
      </div>

      <div>
        {loading && <div className="h-full flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--neon-green)', borderTopColor: 'transparent' }} /></div>}
        {result && !loading && (
          <ResultCard>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{result.disease_name}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,233,191,0.1)', color: 'var(--neon-green)' }}>{Math.round(result.confidence * 100)}% confidence</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>{result.severity}</span>
                </div>
              </div>
              {result.severity === 'healthy' ? <CheckCircle className="h-8 w-8 flex-shrink-0" style={{ color: 'var(--neon-green)' }} /> : <AlertTriangle className="h-8 w-8 flex-shrink-0" style={{ color: '#fbbf24' }} />}
            </div>
            {result.treatment?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--circle)' }}>Treatment</p>
                <ul className="space-y-1">{result.treatment.map((t: string, i: number) => <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--old-price)' }}><span style={{ color: 'var(--neon-green)' }}>•</span>{t}</li>)}</ul>
              </div>
            )}
            {result.prevention?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--circle)' }}>Prevention</p>
                <ul className="space-y-1">{result.prevention.map((p: string, i: number) => <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--old-price)' }}><span style={{ color: '#60a5fa' }}>•</span>{p}</li>)}</ul>
              </div>
            )}
          </ResultCard>
        )}
        {!result && !loading && <EmptyResult icon={Bug} text="Upload a crop image to detect diseases" />}
      </div>
    </div>
  );
}

// ── Yield Tab ──────────────────────────────────────────────────────────────────
function YieldTab() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true); setError('');
    try { const { data } = await agropilotApi.post('/api/predict/yield', form); setResult(data); }
    catch (err: any) { setError(typeof err === 'string' ? err : 'Prediction failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelectInput label="Crop Type" options={CROP_OPTIONS} value={form.crop_type} onChange={(v) => set('crop_type', v)} />
          <SelectInput label="Soil Type" options={SOIL_OPTIONS} value={form.soil_type} onChange={(v) => set('soil_type', v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FieldInput label="Soil pH" type="number" step="0.1" min="0" max="14" value={form.soil_ph} onChange={(e) => set('soil_ph', parseFloat(e.target.value))} />
          <FieldInput label="N (kg/ha)" type="number" value={form.nitrogen} onChange={(e) => set('nitrogen', parseFloat(e.target.value))} />
          <FieldInput label="P (kg/ha)" type="number" value={form.phosphorus} onChange={(e) => set('phosphorus', parseFloat(e.target.value))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FieldInput label="K (kg/ha)" type="number" value={form.potassium} onChange={(e) => set('potassium', parseFloat(e.target.value))} />
          <FieldInput label="Rainfall (mm)" type="number" value={form.rainfall_mm} onChange={(e) => set('rainfall_mm', parseFloat(e.target.value))} />
          <FieldInput label="Temp (°C)" type="number" value={form.temperature_c} onChange={(e) => set('temperature_c', parseFloat(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldInput label="Humidity (%)" type="number" value={form.humidity_pct} onChange={(e) => set('humidity_pct', parseFloat(e.target.value))} />
          <FieldInput label="Area (ha)" type="number" step="0.1" value={form.area_hectares} onChange={(e) => set('area_hectares', parseFloat(e.target.value))} />
        </div>
        {error && <p className="text-sm rounded-lg p-2" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>{error}</p>}
        <button onClick={predict} disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--neon-green)', color: '#000' }}>
          <TrendingUp className="h-4 w-4" /> {loading ? 'Calculating...' : 'Predict Yield'}
        </button>
      </div>
      <div>
        {loading && <div className="h-full flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--neon-green)', borderTopColor: 'transparent' }} /></div>}
        {result && !loading && (
          <ResultCard>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(0,233,191,0.05)' }}>
              <p className="text-sm" style={{ color: 'var(--old-price)' }}>Predicted Yield</p>
              <p className="text-4xl font-bold mt-1" style={{ color: 'var(--neon-green)' }}>{result.predicted_yield_kg_per_ha?.toLocaleString()}</p>
              <p className="text-sm" style={{ color: 'var(--old-price)' }}>kg / hectare</p>
              <span className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block" style={{ background: 'rgba(0,233,191,0.1)', color: 'var(--neon-green)' }}>{Math.round(result.confidence * 100)}% confidence</span>
            </div>
            {result.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--circle)' }}>Recommendations</p>
                <ul className="space-y-1">{result.recommendations.map((r: string, i: number) => <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--old-price)' }}><span style={{ color: 'var(--neon-green)' }}>✓</span>{r}</li>)}</ul>
              </div>
            )}
            {result.explanation && <p className="text-sm rounded-lg p-3" style={{ color: 'var(--old-price)', background: 'var(--foot-color)' }}>{result.explanation}</p>}
          </ResultCard>
        )}
        {!result && !loading && <EmptyResult icon={TrendingUp} text="Fill in crop data to predict yield" />}
      </div>
    </div>
  );
}

// ── Fertilizer Tab ─────────────────────────────────────────────────────────────
function FertilizerTab() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const recommend = async () => {
    setLoading(true); setError('');
    try { const { data } = await agropilotApi.post('/api/predict/fertilizer', form); setResult(data); }
    catch (err: any) { setError(typeof err === 'string' ? err : 'Recommendation failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelectInput label="Crop Type" options={CROP_OPTIONS} value={form.crop_type} onChange={(v) => set('crop_type', v)} />
          <SelectInput label="Soil Type" options={SOIL_OPTIONS} value={form.soil_type} onChange={(v) => set('soil_type', v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FieldInput label="Soil pH" type="number" step="0.1" min="0" max="14" value={form.soil_ph} onChange={(e) => set('soil_ph', parseFloat(e.target.value))} />
          <FieldInput label="N (kg/ha)" type="number" value={form.nitrogen} onChange={(e) => set('nitrogen', parseFloat(e.target.value))} />
          <FieldInput label="P (kg/ha)" type="number" value={form.phosphorus} onChange={(e) => set('phosphorus', parseFloat(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldInput label="K (kg/ha)" type="number" value={form.potassium} onChange={(e) => set('potassium', parseFloat(e.target.value))} />
          <FieldInput label="Target Yield (kg/ha)" type="number" value={form.target_yield} onChange={(e) => set('target_yield', parseFloat(e.target.value))} />
        </div>
        <SelectInput label="Growth Stage" options={['germination', 'vegetative', 'flowering', 'fruiting', 'maturity']} value={form.growth_stage} onChange={(v) => set('growth_stage', v)} />
        {error && <p className="text-sm rounded-lg p-2" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>{error}</p>}
        <button onClick={recommend} disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--neon-green)', color: '#000' }}>
          <Leaf className="h-4 w-4" /> {loading ? 'Generating...' : 'Get Recommendation'}
        </button>
      </div>
      <div>
        {loading && <div className="h-full flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--neon-green)', borderTopColor: 'transparent' }} /></div>}
        {result && !loading && (
          <ResultCard>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.05)' }}>
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--circle)' }}>Primary Fertilizer</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-color)' }}>{result.primary_fertilizer}</p>
              <p className="text-sm" style={{ color: 'var(--old-price)' }}>{result.quantity_kg_per_ha} kg/ha</p>
            </div>
            {result.secondary_fertilizers?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--circle)' }}>Additional Fertilizers</p>
                <div className="space-y-2">
                  {result.secondary_fertilizers.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg text-sm" style={{ background: 'var(--foot-color)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-color)' }}>{f.name}</span>
                      <span style={{ color: 'var(--old-price)' }}>{f.quantity_kg_per_ha} kg/ha</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.application_schedule && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--circle)' }}>Application Schedule</p>
                <p className="text-sm" style={{ color: 'var(--old-price)' }}>{result.application_schedule}</p>
              </div>
            )}
            {result.explanation && <p className="text-sm rounded-lg p-3" style={{ color: 'var(--old-price)', background: 'var(--foot-color)' }}>{result.explanation}</p>}
          </ResultCard>
        )}
        {!result && !loading && <EmptyResult icon={Leaf} text="Enter crop details for fertilizer advice" />}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function AnalysisContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return (t === 'yield' || t === 'fertilizer' || t === 'disease') ? t : 'disease';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>AI Crop Analysis</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--old-price)' }}>Disease detection, yield prediction, and fertilizer recommendations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border p-1 w-fit" style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={tab === id
              ? { background: 'var(--neon-green)', color: '#000' }
              : { color: 'var(--old-price)' }}>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border p-6" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {tab === 'disease' && <DiseaseTab />}
        {tab === 'yield' && <YieldTab />}
        {tab === 'fertilizer' && <FertilizerTab />}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--neon-green)', borderTopColor: 'transparent' }} /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
